class AddEmailAndConfirmationToUsuarios < ActiveRecord::Migration[8.0]
  def change
    add_column :usuarios, :email, :string
    add_index :usuarios, :email, unique: true
    add_column :usuarios, :confirmed_at, :datetime
    add_column :usuarios, :confirmation_token, :string
    add_index :usuarios, :confirmation_token, unique: true
    add_column :usuarios, :unconfirmed_email, :string
  end
end
