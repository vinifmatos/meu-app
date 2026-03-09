class AddDefaultsToImportacaoScryfall < ActiveRecord::Migration[8.0]
  def change
    change_column_default :importacoes_scryfall, :progresso, from: nil, to: 0.0
    change_column_default :importacoes_scryfall, :readed_size, from: nil, to: 0

    # Atualiza registros existentes que podem estar com null
    change_column_null :importacoes_scryfall, :progresso, false, 0.0
    change_column_null :importacoes_scryfall, :readed_size, false, 0
  end
end
