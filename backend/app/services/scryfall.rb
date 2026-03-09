module Scryfall
  class << self
    def importar_simbolos(record: nil)
      Importadores::Simbolos.importar(record: record)
    end

    def importar_cartas(record: nil)
      Importadores::Cartas.importar(record: record)
    end
  end

  class ImportError < StandardError; end
  class ImportCancelledError < StandardError; end
end
