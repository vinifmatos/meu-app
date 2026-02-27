class CreateUsuarios < ActiveRecord::Migration[8.0]
  def change
    create_table :usuarios do |t|
      t.string :username
      t.string :name

      t.timestamps
    end
  end
end
