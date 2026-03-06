class ScryfallImportJob < ApplicationJob
  queue_as :default

  def perform(id, force: false)
    raise ArgumentError, "Deve ser informado um ID válido" unless id.present?

    record = ImportacaoScryfall.find(id)

    case record.tipo.to_sym
    when :simbolos
      Scryfall::Importador.importar_simbolos(record: record)
    when :bulk_data
      Scryfall::Importador.importar_cartas(force: force, record: record)
    when :carta
      Scryfall::Importador.importar_carta(force: force, record: record)
    else
      raise "Tipo de importação inválido: #{tipo}"
    end
  end
end
