class AddPrintedFieldsToCartas < ActiveRecord::Migration[8.0]
  def change
    add_column :cartas, :printed_name, :string
    add_column :cartas, :printed_type_line, :string
  end
end
