class Simbolo < ApplicationRecord
  def self.import_from_scryfall(data)
    simbolos_attributes = data.map do |symbol_data|
      {
        symbol: symbol_data["symbol"],
        english: symbol_data["english"],
        represents_mana: symbol_data["represents_mana"],
        mana_value: symbol_data["mana_value"],
        appears_in_mana_costs: symbol_data["appears_in_mana_costs"],
        colors: symbol_data["colors"],
        hybrid: symbol_data["hybrid"],
        phyrexian: symbol_data["phyrexian"],
        svg_uri: symbol_data["svg_uri"]
      }
    end

    upsert_all(simbolos_attributes, unique_by: :symbol) if simbolos_attributes.any?
  end
end
