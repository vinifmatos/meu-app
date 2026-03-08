class CreateImportacoesScryfall < ActiveRecord::Migration[8.0]
  def change
    create_table :importacoes_scryfall do |t|
      t.integer :tipo
      t.integer :status
      t.integer :progresso
      t.integer :size_processado
      t.text :mensagem_erro
      t.jsonb :metadata
      t.datetime :started_at
      t.datetime :finished_at

      t.timestamps
    end
  end
end
