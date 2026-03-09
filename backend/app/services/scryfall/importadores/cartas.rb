module Scryfall
  module Importadores
    class Cartas < Base
      def self.importar(record: nil)
        new(record: record).importar
      end

      def importar
        @record ||= ImportacaoScryfall.create!(tipo: :bulk_data)

        processar_com_status do
          file_path = buscar_arquivo_recente
          validar_arquivo!(file_path)

          # O progresso agora é baseado no tamanho do arquivo comprimido (real e preciso)
          total_compressed_size = File.size(file_path)
          @record.update!(
            file_path: file_path,
            file_size: total_compressed_size,
            readed_size: 0,
            progresso: 0.0
          )

          parser = ParserCartasJson.new(record: @record)

          # Usamos pipe de escrita para alimentar o bzcat e monitorar o progresso do disco
          File.open(file_path, "rb") do |file|
            IO.popen([ "bzcat" ], "r+") do |bz|
              # Thread para alimentar o descompactador
              writer = Thread.new do
                import_logger.info "[Cartas] Thread writer iniciada para #{file_path}"
                ActiveRecord::Base.connection_pool.with_connection do
                  chunks_count = 0
                  bytes_acumulados = 0
                  bytes_para_cancelamento = 0
                  threshold_update = 2.megabytes
                  threshold_cancelamento = 1.megabyte

                  while chunk = file.read(CHUNK_SIZE)
                    bytes_acumulados += chunk.bytesize
                    bytes_para_cancelamento += chunk.bytesize

                    # Verifica cancelamento a cada 1MB (evita excesso de queries de reload)
                    if bytes_para_cancelamento >= threshold_cancelamento
                      bytes_para_cancelamento = 0
                      if @record.reload.cancelado?
                        import_logger.warn "[Cartas] Cancelamento detectado no writer. Encerrando..."
                        break
                      end
                    end

                    bz.write(chunk)
                    chunks_count += 1

                    if bytes_acumulados >= threshold_update
                      @record.update_progresso!(bytes_acumulados)
                      bytes_acumulados = 0
                      import_logger.debug "[Cartas] Chunks processados: #{chunks_count}, Progresso: #{@record.reload.progresso}%"
                    end
                  end

                  # Garantir última atualização do que sobrou no buffer
                  @record.update_progresso!(bytes_acumulados) if bytes_acumulados > 0
                rescue IOError, Errno::EPIPE => e
                  import_logger.warn "[Cartas] Pipe interrompido (provável cancelamento): #{e.message}"
                rescue StandardError => e
                  import_logger.error "[Cartas] Erro fatal na thread writer: #{e.message}"
                  import_logger.error e.backtrace.join("\n")
                  @record&.falhar!("Erro no writer: #{e.message}")
                ensure
                  begin
                    bz.close_write unless bz.closed?
                  rescue IOError
                    nil
                  end
                  import_logger.info "[Cartas] Thread writer finalizada. Total chunks: #{chunks_count}"
                end
              end


              # Processamos o fluxo descompactado no thread principal
              begin
                while uncompressed_chunk = bz.read(CHUNK_SIZE)
                  parser << uncompressed_chunk
                end
              rescue ImportCancelledError
                # O parser lança isso. Precisamos garantir que o writer morra.
                import_logger.warn "[Cartas] Importação cancelada no thread principal."
                raise
              ensure
                writer.join
              end
            end
          end

          raise ImportError, "Erro ao descompactar bulk data: #{file_path}" if $?.exitstatus != 0 && !@record.cancelado?
          parser.finish!
        end
      end

      private

      def buscar_arquivo_recente
        Dir.glob(File.join(data_dir, "all-cards-*.json.bz2")).sort.last
      end

      def validar_arquivo!(path)
        raise ImportError, "Arquivo bulk data não encontrado em: #{data_dir}" unless path && File.exist?(path)
      end
    end
  end
end
