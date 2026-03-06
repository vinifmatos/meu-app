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
        raise ApiError, "Sem dados dos simbolos"
      end
    rescue StandardError => e
      raise ApiError, "Erro ao baixar o arquivo dos simbolos: #{e.message}"
    end

    def baixar_todas_as_cartas(force: false)
      bulk_data = ultimo_bulk_data
      return unless bulk_data && bulk_data["download_uri"]

      fazer_download = arquivo_bulk_desatualizado?(bulk_data["updated_at"]) ||
                       arquivo_bulk_corrompido? ||
                       force

      if fazer_download
        baixar_bulk_para_arquivo(bulk_data["download_uri"])
      end

      [ caminho_arquivo_bulk, bulk_data ]
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

    def ultimo_bulk_data
      response = @client.get("#{BASE_URL}/bulk-data/default_cards")

      if response.status.success?
        JSON.parse(response.body.to_s)
      else
        raise ApiError, "Sem dados do ultimo bulk data"
      end
    end

    private

    def caminho_arquivo_bulk
      Rails.root.join("tmp", "scryfall", "default_cards.json")
    end

    def garantir_diretorio_bulk
      FileUtils.mkdir_p(File.dirname(caminho_arquivo_bulk))
    end

    def arquivo_bulk_existe?
      File.exist?(caminho_arquivo_bulk)
    end

    def baixar_bulk_para_arquivo(download_uri)
      garantir_diretorio_bulk

      response = @client.get(download_uri)

      unless response.status.success?
        raise ApiError, "Failed to download bulk data"
      end

      File.open("#{caminho_arquivo_bulk}.lock", "w") do |lock|
        lock.flock(File::LOCK_EX)

        return if arquivo_bulk_existe? && !arquivo_bulk_desatualizado?(ultimo_bulk_data["updated_at"])

        File.open(caminho_arquivo_bulk, "wb") do |file|
          response.body.each do |chunk|
            file.write(chunk)
          end
        end
      end
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
    BATCH_SIZE = Rails.env.production? ? 2000 : 5000

    def initialize(record: nil)
      @parser = Yajl::FFI::Parser.new
      @record = record

      @batch = []
      @stack = []
      @current_key = nil

      @parser.start_array do
        if @stack.any?
          array = []
          add_value(@stack.last, @current_key, array)
          @stack.push(array)
        end
      end

      @parser.end_array do
        if @stack.any?
          @stack.pop
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
      check_cancellation!
      @parser << data
    end

    def finish!
      importar_lote if @batch.any?
    end

    private

    def check_cancellation!
      if @record&.reload&.cancelado?
        raise ImportCancelledError, "Importação cancelada pelo usuário"
      end
    end

    def handle_completed_item(item)
      return unless item.is_a?(Hash) && item.any?

      @batch << item
      if @batch.size >= BATCH_SIZE
        importar_lote
      end
    end

    def importar_lote
      Carta.import_from_scryfall(@batch)

      if @record
        @record.update_progresso!(Importador::CHUNK_SIZE)
      end

      @batch.clear
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
    CHUNK_SIZE = 64.kilobyte

    def self.importar_simbolos(record: nil)
      new.importar_simbolos(record: record)
    end

    def self.importar_cartas(force: false, record: nil)
      new.importar_cartas(force: force, record: record)
    end

    def importar_simbolos(record: nil)
      record ||= ImportacaoScryfall.create!(tipo: :simbolos, status: :pendente, started_at: Time.current)
      return unless record.pendente?

      record.update!(status: :processando, started_at: Time.current)

      api = Api.new
      symbols_data = api.baixar_simbolos

      Simbolo.import_from_scryfall(symbols_data)

      record.finalizar!
      record
    rescue StandardError => e
      record&.falhar!(e.message)
      raise e
    end

    def importar_cartas(force: false, record: nil)
      record ||= ImportacaoScryfall.create!(tipo: :bulk_data, status: :pendente, started_at: Time.current)
      return unless record.pendente?

      record.update!(status: :processando, started_at: Time.current)

      api = Api.new
      file_path, metadata = api.baixar_todas_as_cartas(force: force)

      record.update!(
        metadata: metadata,
        size_processado: 0,
      )

      parser = ParserCartasJson.new(record: record)

      File.open(file_path, "rb") do |file|
        while chunk = file.read(CHUNK_SIZE)
          parser << chunk
        end
      end

      parser.finish!
      record.finalizar!
      record
    rescue ImportCancelledError => e
      record.update!(status: :cancelado, finished_at: Time.current)
      nil
    rescue StandardError => e
      record&.falhar!(e.message)
      raise ImportError, e.message
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
  end

  class ApiError < StandardError; end

  class ImportError < StandardError; end

  class ImportCancelledError < StandardError; end
end
