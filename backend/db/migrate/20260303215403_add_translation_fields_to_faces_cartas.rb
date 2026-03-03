class AddTranslationFieldsToFacesCartas < ActiveRecord::Migration[8.0]
  def change
    add_column :faces_cartas, :printed_name, :string
    add_column :faces_cartas, :printed_type_line, :string
    add_column :faces_cartas, :printed_text, :text
  end
end
