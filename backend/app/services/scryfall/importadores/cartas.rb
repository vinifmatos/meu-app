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

          @record.update!(
            metadata: { "file_path" => file_path, "size" => estimar_tamanho_descompactado(file_path) },
            size_processado: 0
          )

          parser = ParserCartasJson.new(record: @record)

          IO.popen(["bzcat", file_path]) do |pipe|
            while chunk = pipe.read(CHUNK_SIZE)
              parser << chunk
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

      def estimar_tamanho_descompactado(path)
        # Bzip2 ratio is usually around 5-10x for JSON. 
        # But we can get the actual size using bzip2 -l or similar if available, 
        # or just use the compressed size as a base for progress if we change the logic.
        # For now, let's use the compressed size as a proxy if we can't get the exact one.
        File.size(path) * 8 # Heuristic for progress bar
      end
    end
  end
end
