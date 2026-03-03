class AddPrintedTextToCartas < ActiveRecord::Migration[8.0]
  def change
    add_column :cartas, :printed_text, :text
  end
end
