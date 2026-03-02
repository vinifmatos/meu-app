class CreateFaceCarta < ActiveRecord::Migration[8.0]
  def change
    create_table :face_carta do |t|
      t.references :carta, null: false, foreign_key: true
      t.integer :face, null: false
      t.string :power
      t.string :toughness
      t.string :type_line
      t.string :mana_cost
      t.json :colors
      t.string :name, null: false
      t.text :oracle_text, null: false
      t.json :image_uris

      t.timestamps
    end
  end
end
