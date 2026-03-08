module Scryfall
  module Importadores
    class Base
      CHUNK_SIZE = 64.kilobyte

      def initialize(record: nil)
        @record = record
      end

      protected

      def data_dir
        ENV.fetch('SCRYFALL_DATA_DIR') do
          raise ImportError, "Variável de ambiente SCRYFALL_DATA_DIR não definida"
        end
      end

      def processar_com_status
        return unless @record.pendente?

        @record.update!(status: :processando, started_at: Time.current)
        yield
        @record.finalizar!
        @record
      rescue ImportCancelledError
        @record.update!(status: :cancelado, finished_at: Time.current)
        nil
      rescue StandardError => e
        @record&.falhar!(e.message)
        raise ImportError, e.message
      end
    end
  end
end
