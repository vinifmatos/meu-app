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
            readed_size: 0
          )

          parser = ParserCartasJson.new(record: @record)

          # Usamos pipe de escrita para alimentar o bzcat e monitorar o progresso do disco
          File.open(file_path, "rb") do |file|
            IO.popen([ "bzcat" ], "r+") do |bz|
              # Thread para alimentar o descompactador
              writer = Thread.new do
                while chunk = file.read(CHUNK_SIZE)
                  bz.write(chunk)
                  @record.update_progresso!(chunk.bytesize) # Progresso baseado no arquivo bz2
                end
                bz.close_write
              rescue StandardError => e
                @record&.falhar!("Erro no writer: #{e.message}")
              end

              # Processamos o fluxo descompactado no thread principal
              while uncompressed_chunk = bz.read(CHUNK_SIZE)
                parser << uncompressed_chunk
              end
              writer.join
            end
          end

          raise ImportError, "Erro ao descompactar bulk data: #{file_path}" if $?.exitstatus != 0
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
