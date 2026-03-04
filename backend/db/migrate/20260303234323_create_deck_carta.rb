class CreateDeckCarta < ActiveRecord::Migration[8.0]
  def change
    create_table :deck_cartas do |t|
      t.references :deck, null: false, foreign_key: true
      t.references :carta, null: false, foreign_key: true
      t.integer :quantidade
      t.boolean :eh_comandante

      t.timestamps
    end
  end
end
