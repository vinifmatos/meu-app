module Scryfall
  class ParserCartasJson
    BATCH_SIZE = Rails.env.production? ? 2000 : 5000
    CANCELLATION_CHECK_INTERVAL = 50

    def initialize(record: nil)
      @parser = Yajl::FFI::Parser.new
      @record = record

      @batch = []
      @stack = []
      @current_key = nil
      @chunks_count = 0

      setup_callbacks
    end

    def <<(data)
      @chunks_count += 1
      check_cancellation! if @chunks_count % CANCELLATION_CHECK_INTERVAL == 0
      @parser << data
    end

    def finish!
      importar_lote if @batch.any?
    end

    private

    def setup_callbacks
      @parser.start_array { handle_start_array }
      @parser.end_array { handle_end_array }
      @parser.start_object { handle_start_object }
      @parser.end_object { handle_end_object }
      @parser.key { |key| @current_key = key }
      @parser.value { |value| handle_value(value) }
    end

    def handle_start_array
      if @stack.any?
        array = []
        add_value(@stack.last, @current_key, array)
        @stack.push(array)
      end
    end

    def handle_end_array
      @stack.pop if @stack.any?
    end

    def handle_start_object
      hash = {}
      add_value(@stack.last, @current_key, hash) if @stack.any?
      @stack.push(hash)
    end

    def handle_end_object
      completed = @stack.pop
      handle_completed_item(completed) if @stack.empty?
    end

    def handle_value(value)
      add_value(@stack.last, @current_key, value) if @stack.any?
    end

    def check_cancellation!
      raise ImportCancelledError, "Importação cancelada pelo usuário" if @record&.reload&.cancelado?
    end

    def handle_completed_item(item)
      return unless item.is_a?(Hash) && item.any?

      @batch << item
      importar_lote if @batch.size >= BATCH_SIZE
    end

    def importar_lote
      Carta.import_from_scryfall(@batch)
      @batch.clear
    end

    def add_value(container, key, value)
      container.is_a?(Array) ? container << value : container[key] = value
    end
  end
end
