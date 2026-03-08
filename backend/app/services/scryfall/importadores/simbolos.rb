module Scryfall
  module Importadores
    class Simbolos < Base
      def self.importar(record: nil)
        new(record: record).importar
      end

      def importar
        @record ||= ImportacaoScryfall.create!(tipo: :simbolos)

        processar_com_status do
          path = File.join(data_dir, "simbolos.json.bzip")
          validar_arquivo!(path)

          content = descompactar(path)
          data = JSON.parse(content)
          simbolos = data.is_a?(Hash) && data.key?("data") ? data["data"] : data

          Simbolo.import_from_scryfall(simbolos)
        end
      end

      private

      def validar_arquivo!(path)
        raise ImportError, "Arquivo de símbolos não encontrado em: #{path}" unless File.exist?(path)
      end

      def descompactar(path)
        content = `bzcat "#{path}"`
        raise ImportError, "Erro ao descompactar o arquivo de símbolos: #{path}" if $?.exitstatus != 0
        content
      end
    end
  end
end
