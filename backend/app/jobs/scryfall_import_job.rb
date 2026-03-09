class ScryfallImportJob < ApplicationJob
  queue_as :default

  def perform(id)
    raise ArgumentError, "Deve ser informado um ID válido" unless id.present?

    record = ImportacaoScryfall.find(id)

    case record.tipo.to_sym
    when :simbolos
      Scryfall.importar_simbolos(record: record)
    when :bulk_data
      Scryfall.importar_cartas(record: record)
    else
      raise "Tipo de importação inválido: #{record.tipo}"
    end
  end
end
