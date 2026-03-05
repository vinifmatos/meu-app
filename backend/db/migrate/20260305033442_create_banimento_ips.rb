class CreateBanimentoIps < ActiveRecord::Migration[8.0]
  def change
    create_table :banimento_ips do |t|
      t.string :ip, null: false
      t.string :motivo

      t.timestamps
    end
    add_index :banimento_ips, :ip, unique: true
  end
end
