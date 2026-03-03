class AddReleasedAtAndRarityToCartas < ActiveRecord::Migration[8.0]
  def change
    add_column :cartas, :released_at, :date
    add_column :cartas, :rarity, :string
  end
end
