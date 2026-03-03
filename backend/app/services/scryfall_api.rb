module Scryfall
  class Api
  BASE_URL = "https://api.scryfall.com"

  def initialize
    @client = HTTP.use(:auto_inflate).headers("Accept" => "application/json")
  end

  def symbols
    response = @client.get("#{BASE_URL}/symbology")

    if response.status.success?
      JSON.parse(response.body.to_s)["data"]
    else
      []
    end
  rescue StandardError => e
    raise e if Rails.env.development?

    raise Error, "Failed to fetch symbols from Scryfall API: #{e.message}"
  end

  def latest_bulk_data
    response = @client.get("#{BASE_URL}/bulk-data/all_cards")

    if response.status.success?
      JSON.parse(response.body.to_s)
    else
      nil
    end
  end

  def all_cards(&block)
    bulk_data = get_bulk_data
    return unless bulk_data && bulk_data["download_uri"]

    response = @client.get(bulk_data["download_uri"])
    if response.status.success?
      begin
        parser = CardJsonParser.new
        response.body.each do |chunk|
          parser << chunk
        end
      rescue StandardError => e
        raise e if Rails.env.development?

        raise Error, "Failed to parse Scryfall API response: #{e.message}"
      end
    else
      nil
    end
  rescue StandardError => e
    raise e if Rails.env.development?

    raise Error, "Failed to fetch cards from Scryfall API: #{e.message}"
  end

  def self.import_data
    api = new
    threads = []
    threads << Thread.new do
      symbols_data = api.symbols
      if symbols_data
        Simbolo.import_from_scryfall(symbols_data)
      else
        raise LoadFailure, "Failed to fetch symbols from Scryfall API"
      end
    end

    threads << Thread.new do
      api.all_cards
    end

    threads.each(&:join)

    nil
  end

  class CardJsonParser
    BATCH_SIZE = 1000

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
            GC.start
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

    private

    def add_value(container, key, value)
      if container.is_a?(Array)
        container << value
      else
        container[key] = value
      end
    end
  end

  class Error < StandardError; end

  class LoadFailure < Error; end
  end
end
