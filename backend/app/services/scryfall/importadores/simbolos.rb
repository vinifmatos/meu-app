module Scryfall
  module Importadores
    class Simbolos < Base
      def self.importar(record: nil)
        new(record: record).importar
      end

      def importar
        @record ||= ImportacaoScryfall.create!(tipo: :simbolos)

        processar_com_status do
          path = File.join(data_dir, "simbolos.json.bz2")
          validar_arquivo!(path)

          @record.update!(
            file_path: path,
            file_size: File.size(path),
            readed_size: 0
          )

          content = descompactar(path)
          data = JSON.parse(content)

          Simbolo.import_from_scryfall(data)
          @record.update!(readed_size: @record.file_size)
        end
      end

      private

      def validar_arquivo!(path)
        raise ImportError, "Arquivo de símbolos não encontrado em: #{path}" unless File.exist?(path)
      end

      def descompactar(path)
        content = IO.popen([ "bzcat", path ], "r", &:read)
        raise ImportError, "Erro ao descompactar o arquivo de símbolos: #{path}" if $?.exitstatus != 0
        content
      end
    end
  end
end
