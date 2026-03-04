class AddLegalitiesToCartas < ActiveRecord::Migration[8.0]
  def change
    add_column :cartas, :legalities, :jsonb
  end
end
