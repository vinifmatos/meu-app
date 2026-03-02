class CreateCartas < ActiveRecord::Migration[8.0]
  def change
    create_table :cartas do |t|
      t.string :scryfall_id, null: false, unique: true
      t.string :oracle_id, null: false
      t.string :uri, null: false
      t.string :power
      t.string :toughness
      t.string :mana_cost
      t.string :set, null: false
      t.string :collector_number, null: false
      t.string :lang, null: false
      t.json :colors
      t.json :color_identity
      t.json :color_indicator
      t.string :name, null: false
      t.string :type_line, null: false
      t.text :oracle_text, null: false
      t.json :image_uris

      t.index :oracle_id
      t.index :lang

      t.timestamps
    end
  end
end
