module Scryfall
  class Api
    BASE_URL = "https://api.scryfall.com"

    def initialize
      @client = HTTP.use(:auto_inflate).headers("Accept" => "application/json")
    end

    def download_symbols
      response = @client.get("#{BASE_URL}/symbology")

      if response.status.success?
        JSON.parse(response.body.to_s)["data"]
      else
        raise "Sem dados dos simbolos"
      end
    rescue StandardError => e
      raise ApiError, "Erro ao baixar o arquivo dos simbolos: #{e.message}"
    end

    def download_all_cards(force: false)
      bulk_data = latest_bulk_data
      return unless bulk_data && bulk_data["download_uri"]

      fazer_download = bulk_file_outdated?(bulk_data["updated_at"]) ||
        bulk_file_corrupted? ||
        force
      return bulk_file_path unless fazer_download

      download_bulk_to_file(bulk_data["download_uri"])
    rescue StandardError => e
      raise ApiError, "Erro ao baixar o arquivo do bulk data: #{e.message}"
    end

    private

    def bulk_file_path
      Rails.root.join("tmp", "scryfall", "all_cards.json")
    end

    def ensure_bulk_directory
      FileUtils.mkdir_p(File.dirname(bulk_file_path))
    end

    def bulk_file_exists?
      File.exist?(bulk_file_path)
    end

    def latest_bulk_data
      response = @client.get("#{BASE_URL}/bulk-data/all_cards")

      if response.status.success?
        JSON.parse(response.body.to_s)
      else
        raise "Sem dados do ultimo bulk data"
      end
    end

    def download_bulk_to_file(download_uri)
      ensure_bulk_directory

      response = @client.get(download_uri)

      unless response.status.success?
        raise ApiError, "Failed to download bulk data"
      end

      File.open("#{bulk_file_path}.lock", "w") do |lock|
        lock.flock(File::LOCK_EX)

        # verifica novamente depois de pegar o lock
        return bulk_file_path if bulk_file_exists?

        File.open(bulk_file_path, "wb") do |file|
          response.body.each do |chunk|
            file.write(chunk)
          end
        end
      end

      bulk_file_path
    end

    def bulk_file_outdated?(updated_at)
      return true unless bulk_file_exists?

      remote_time = Time.zone.parse(updated_at)
      File.mtime(bulk_file_path) < remote_time
    end

    def bulk_file_corrupted?
      return false unless bulk_file_exists?

      corrupted = File.size(bulk_file_path) < 2.gigabytes
      File.delete(bulk_file_path) if corrupted

      corrupted
    end
  end

  class CardsJsonParser
    BATCH_SIZE = 500

    def initialize
      @parser = Yajl::FFI::Parser.new

      @batch = []
      @stack = []
      @current_key = nil

      @parser.start_array do
        array = []
        if @stack.empty?
          @stack.push(array)
        else
          add_value(@stack.last, @current_key, array)
          @stack.push(array)
        end
      end

      @parser.end_array do
        completed = @stack.pop

        # Se terminou um elemento do array raiz
        if @stack.size == 1
          @batch << completed

          if @batch.size >= BATCH_SIZE
            Carta.import_from_scryfall(@batch)
            @batch.clear
          end
        end
      end

      @parser.start_object do
        hash = {}
        if @stack.empty?
          @stack.push(hash)
        else
          add_value(@stack.last, @current_key, hash)
          @stack.push(hash)
        end
      end

      @parser.end_object do
        completed = @stack.pop

        # Se é objeto direto do array raiz
        if @stack.size == 1
          @batch << completed

          if @batch.size >= BATCH_SIZE
            Carta.import_from_scryfall(@batch)
            @batch.clear
            GC.start
          end
        end
      end

      @parser.key do |key|
        @current_key = key
      end

      @parser.value do |value|
        add_value(@stack.last, @current_key, value)
      end
    end

    def <<(data)
      @parser << data
    end

    def finish!
      if @batch.any?
        Carta.import_from_scryfall(@batch)
        @batch.clear
      end
    end

    private

    def add_value(container, key, value)
      if container.is_a?(Array)
        container << value
      else
        container[key] = value
      end
    end
  end

  class Importer
    def self.import
      Importer.new.import!
    end

    def self.import!
      Importer.new.import!
    end

    def import!
      import(force: true)
    end

    def import(force: false)
      api = Api.new

      import_symbols(api)
      import_cards(api, force: force)

      nil
    end

    def import_symbols(api)
      symbols_data = api.download_symbols
      Simbolo.import_from_scryfall(symbols_data)
    rescue StandardError => e
      raise e if Rails.env.development?

      raise ImportError, "Erro ao importar os simbolos: #{e.message}"
    end

    def import_cards(api, force: false)
      file_path = api.download_all_cards(force: force)
      parser = CardsJsonParser.new

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
