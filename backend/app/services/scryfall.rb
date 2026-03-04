module Scryfall
  class Api
    BASE_URL = "https://api.scryfall.com"

    def initialize
      @client = HTTP.use(:auto_inflate).headers("Accept" => "application/json")
    end

    def baixar_simbolos
      response = @client.get("#{BASE_URL}/symbology")

      if response.status.success?
        JSON.parse(response.body.to_s)["data"]
      else
        raise "Sem dados dos simbolos"
      end
    rescue StandardError => e
      raise ApiError, "Erro ao baixar o arquivo dos simbolos: #{e.message}"
    end

    def baixar_todas_cartas(force: false)
      bulk_data = ultimo_bulk_data
      return unless bulk_data && bulk_data["download_uri"]

      fazer_download = arquivo_bulk_desatualizado?(bulk_data["updated_at"]) ||
                       arquivo_bulk_corrompido? ||
                       force
      return caminho_arquivo_bulk unless fazer_download

      baixar_bulk_para_arquivo(bulk_data["download_uri"])
    rescue StandardError => e
      raise ApiError, "Erro ao baixar o arquivo do bulk data: #{e.message}"
    end

    def buscar_carta_por_nome(nome, lang: nil)
      params = { fuzzy: nome }
      params[:lang] = lang if lang

      response = @client.get("#{BASE_URL}/cards/named", params: params)

      if response.status.success?
        JSON.parse(response.body.to_s)
      elsif response.status.code == 404
        nil
      else
        raise ApiError, "Erro ao buscar carta '#{nome}': #{response.status.code}"
      end
    end

    private

    def caminho_arquivo_bulk
      Rails.root.join("tmp", "scryfall", "all_cards.json")
    end

    def garantir_diretorio_bulk
      FileUtils.mkdir_p(File.dirname(caminho_arquivo_bulk))
    end

    def arquivo_bulk_existe?
      File.exist?(caminho_arquivo_bulk)
    end

    def ultimo_bulk_data
      response = @client.get("#{BASE_URL}/bulk-data/all_cards")

      if response.status.success?
        JSON.parse(response.body.to_s)
      else
        raise "Sem dados do ultimo bulk data"
      end
    end

    def baixar_bulk_para_arquivo(download_uri)
      garantir_diretorio_bulk

      response = @client.get(download_uri)

      unless response.status.success?
        raise ApiError, "Failed to download bulk data"
      end

      File.open("#{caminho_arquivo_bulk}.lock", "w") do |lock|
        lock.flock(File::LOCK_EX)

        # verifica novamente depois de pegar o lock
        return caminho_arquivo_bulk if arquivo_bulk_existe?

        File.open(caminho_arquivo_bulk, "wb") do |file|
          response.body.each do |chunk|
            file.write(chunk)
          end
        end
      end

      caminho_arquivo_bulk
    end

    def arquivo_bulk_desatualizado?(updated_at)
      return true unless arquivo_bulk_existe?

      remote_time = Time.zone.parse(updated_at)
      File.mtime(caminho_arquivo_bulk) < remote_time
    end

    def arquivo_bulk_corrompido?
      return false unless arquivo_bulk_existe?

      corrupted = File.size(caminho_arquivo_bulk) < 2.gigabytes
      File.delete(caminho_arquivo_bulk) if corrupted

      corrupted
    end
  end

  class ParserCartasJson
    BATCH_SIZE = Rails.env.production? ? 5000 : 10000

    def initialize
      @parser = Yajl::FFI::Parser.new

      @batch = []
      @stack = []
      @current_key = nil

      @parser.start_array do
        # Ignora o array raiz. Se a stack não estiver vazia, é um array aninhado.
        if @stack.any?
          array = []
          add_value(@stack.last, @current_key, array)
          @stack.push(array)
        end
      end

      @parser.end_array do
        if @stack.any?
          @stack.pop
          # Se após o pop a stack ficar vazia, significaria que um array era o objeto raiz.
          # No Scryfall o objeto raiz é sempre um Hash (carta), mas mantemos a segurança.
          check_and_clear_stack if @stack.empty?
        end
      end

      @parser.start_object do
        hash = {}
        if @stack.any?
          add_value(@stack.last, @current_key, hash)
        end
        @stack.push(hash)
      end

      @parser.end_object do
        completed = @stack.pop
        if @stack.empty?
          handle_completed_item(completed)
          @stack.clear # Garante que a stack esteja limpa para o próximo objeto do array raiz
        end
      end

      @parser.key do |key|
        @current_key = key
      end

      @parser.value do |value|
        if @stack.any?
          add_value(@stack.last, @current_key, value)
        end
      end
    end

    def <<(data)
      @parser << data
    end

    def finish!
      importar_lote if @batch.any?
    end

    private

    def handle_completed_item(item)
      # No Scryfall, o arquivo é um array de objetos.
      # Se o item for um Hash com dados, adicionamos ao batch.
      return unless item.is_a?(Hash) && item.any?

      @batch << item
      importar_lote if @batch.size >= BATCH_SIZE
    end

    def importar_lote
      Carta.import_from_scryfall(@batch)
      @batch.clear
    end

    def check_and_clear_stack
      # Método auxiliar para garantir integridade se necessário
      @stack.clear
    end

    def add_value(container, key, value)
      if container.is_a?(Array)
        container << value
      else
        container[key] = value
      end
    end
  end

  class Importador
    def self.importar
      Importador.new.importar!
    end

    def self.importar!
      Importador.new.importar!
    end

    def self.importar_simbolos
      Importador.new.importar_simbolos
    end

    def self.importar_dados(force: false)
      Importador.new.importar_dados(force: force)
    end

    def self.importar_carta_por_nome(nome, lang: nil)
      Importador.new.importar_carta_por_nome(nome, lang: lang)
    end

    def importar!
      importar_dados(force: true)
    end

    def importar_dados(force: false)
      importar_simbolos
      importar_cartas(force: force)

      nil
    end

    def importar_carta_por_nome(nome, lang: nil)
      api = Api.new
      carta_data = api.buscar_carta_por_nome(nome, lang: lang)

      if carta_data
        Carta.import_from_scryfall([ carta_data ])
        true
      else
        msg = "Carta '#{nome}'"
        msg += " no idioma '#{lang}'" if lang
        raise ImportError, "#{msg} não encontrada no Scryfall"
      end
    end

    def importar_simbolos
      api = Api.new
      symbols_data = api.baixar_simbolos
      Simbolo.import_from_scryfall(symbols_data)
    rescue StandardError => e
      raise e if Rails.env.development?

      raise ImportError, "Erro ao importar os simbolos: #{e.message}"
    end

    def importar_cartas(force: false)
      api = Api.new
      file_path = api.baixar_todas_cartas(force: force)
      parser = ParserCartasJson.new

      File.open(file_path, "rb") do |file|
        while chunk = file.read(16 * 1024)
          parser << chunk
        end
      end

      parser.finish!
    rescue StandardError => e
      raise e if Rails.env.development?

      raise ImportError, "Erro ao importar as cartas: #{e.message}"
    end
  end

  class ApiError < StandardError; end

  class ImportError < StandardError; end
end
