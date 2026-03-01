class CreateUsuarios < ActiveRecord::Migration[8.0]
  def change
    create_table :usuarios do |t|
      t.string :username, null: false
      t.string :nome
      t.string :password_digest
      t.integer :role, default: 1, null: false

      t.index :username, unique: true
      t.index :role

      t.timestamps
    end
  end
end
