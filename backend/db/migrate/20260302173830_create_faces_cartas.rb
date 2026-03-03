class CreateFacesCartas < ActiveRecord::Migration[8.0]
  def change
    create_table :faces_cartas do |t|
      t.references :carta, null: false, foreign_key: true
      t.integer :face, null: false
      t.string :power
      t.string :toughness
      t.string :type_line
      t.string :mana_cost
      t.jsonb :colors
      t.string :name, null: false
      t.text :oracle_text
      t.jsonb :image_uris
      t.string :illustration_id

      t.index [ :carta_id, :face, :illustration_id ], unique: true
      t.index :face

      t.timestamps
    end
  end
end
