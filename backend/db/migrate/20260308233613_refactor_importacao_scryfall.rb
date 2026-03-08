class RefactorImportacaoScryfall < ActiveRecord::Migration[8.0]
  def change
    add_column :importacoes_scryfall, :file_path, :string
    add_column :importacoes_scryfall, :file_size, :bigint
    rename_column :importacoes_scryfall, :size_processado, :readed_size
    remove_column :importacoes_scryfall, :metadata, :jsonb
    change_column :importacoes_scryfall, :progresso, :float
  end
end
