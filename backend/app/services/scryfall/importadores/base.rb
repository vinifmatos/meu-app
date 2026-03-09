module Scryfall
  module Importadores
    class Base
      CHUNK_SIZE = 64.kilobytes

      def initialize(record: nil)
        @record = record
      end

      protected

      def data_dir
        ENV.fetch("SCRYFALL_DATA_DIR") do
          raise ImportError, "Variável de ambiente SCRYFALL_DATA_DIR não definida"
        end
      end

      def import_logger
        @import_logger ||= Logger.new(Rails.root.join("log", "scryfall_import.log")).tap do |logger|
          logger.formatter = proc do |severity, datetime, _progname, msg|
            "[#{datetime}] #{severity}: #{msg}\n"
          end
        end
      end

      def processar_com_status
        return unless @record.pendente?

        @record.update!(status: :processando, started_at: Time.current)
        import_logger.info "--- Iniciando processamento: #{@record.tipo} (ID: #{@record.id}) ---"
        
        yield
        
        # Só finaliza se não tiver sido cancelado externamente
        if @record.reload.processando?
          @record.finalizar!
          import_logger.info "--- Processamento finalizado com sucesso: #{@record.id} ---"
        else
          import_logger.info "--- Processamento interrompido (Status: #{@record.status}) ---"
        end
        @record
      rescue ImportCancelledError
        import_logger.warn "Processamento cancelado pelo usuário: #{@record.id}"
        # Se cair aqui, o status já deve ser cancelado ou será definido agora
        @record.update!(status: :cancelado, finished_at: Time.current) unless @record.reload.cancelado?
        nil
      rescue StandardError => e
        import_logger.error "Erro no processamento #{@record.id}: #{e.message}"
        import_logger.error e.backtrace.first(10).join("\n")
        @record&.falhar!(e.message)
        raise ImportError, e.message
      end
    end
  end
end
