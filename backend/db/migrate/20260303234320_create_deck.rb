class CreateDeck < ActiveRecord::Migration[8.0]
  def change
    create_table :decks do |t|
      t.references :usuario, null: false, foreign_key: true
      t.string :nome
      t.integer :formato

      t.timestamps
    end
  end
end
