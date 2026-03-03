class CreateSimbolos < ActiveRecord::Migration[8.0]
  def change
    create_table :simbolos do |t|
      t.string :symbol, null: false
      t.string :english, null: false
      t.boolean :represents_mana, null: false
      t.integer :mana_value
      t.boolean :appears_in_mana_costs, null: false
      t.jsonb :colors, null: false
      t.boolean :hybrid, null: false
      t.boolean :phyrexian, null: false
      t.string :svg_uri

      t.index :symbol, unique: true

      t.timestamps
    end
  end
end
