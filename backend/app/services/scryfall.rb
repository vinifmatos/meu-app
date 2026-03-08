module Scryfall
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

    def self.importar_cartas(record: nil)
      new.importar_cartas(record: record)
    end

    def importar_simbolos(record: nil)
      record ||= ImportacaoScryfall.create!(tipo: :simbolos, status: :pendente, started_at: Time.current)
      return unless record.pendente?

      record.update!(status: :processando, started_at: Time.current)

      data_dir = ENV.fetch('SCRYFALL_DATA_DIR') do
        raise ImportError, "Variável de ambiente SCRYFALL_DATA_DIR não definida"
      end

      path = File.join(data_dir, "simbolos.json.bzip")

      unless File.exist?(path)
        raise ImportError, "Arquivo de símbolos não encontrado em: #{path}"
      end

      # Usando bzcat para ler o arquivo comprimido
      content = `bzcat "#{path}"`
      if $?.exitstatus != 0
        raise ImportError, "Erro ao descompactar o arquivo de símbolos: #{path}"
      end

      symbols_data = JSON.parse(content)
      # O arquivo do Scryfall geralmente vem com os dados sob a chave "data"
      symbols_data = symbols_data["data"] if symbols_data.is_a?(Hash) && symbols_data.key?("data")

      Simbolo.import_from_scryfall(symbols_data)

      record.finalizar!
      record
    rescue StandardError => e
      record&.falhar!(e.message)
      raise ImportError, e.message
    end

    def importar_cartas(record: nil)
      record ||= ImportacaoScryfall.create!(tipo: :bulk_data, status: :pendente, started_at: Time.current)
      return unless record.pendente?

      record.update!(status: :processando, started_at: Time.current)

      data_dir = ENV.fetch('SCRYFALL_DATA_DIR') do
        raise ImportError, "Variável de ambiente SCRYFALL_DATA_DIR não definida"
      end

      file_path = buscar_arquivo_bulk_mais_recente(data_dir)

      unless file_path && File.exist?(file_path)
        raise ImportError, "Arquivo bulk data não encontrado no diretório: #{data_dir}"
      end

      record.update!(
        metadata: { "file_path" => file_path, "last_modified" => File.mtime(file_path) },
        size_processado: 0,
      )

      parser = ParserCartasJson.new(record: record)

      # Usando IO.popen para ler de forma eficiente do bzcat
      IO.popen(["bzcat", file_path]) do |pipe|
        while chunk = pipe.read(CHUNK_SIZE)
          parser << chunk
        end
      end

      if $?.exitstatus != 0
        raise ImportError, "Erro ao descompactar o arquivo bulk data: #{file_path}"
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

    private

    def buscar_arquivo_bulk_mais_recente(dir)
      # Padrão: all-cards-YYYYMMDDHHMMSS.json.bz2
      arquivos = Dir.glob(File.join(dir, "all-cards-*.json.bz2"))
      
      # Ordena pelo nome para pegar o timestamp mais recente (alfabeticamente funciona para o padrão YYYYMMDD...)
      arquivos.sort.last
    end
  end

  class ImportError < StandardError; end

  class ImportCancelledError < StandardError; end
end
