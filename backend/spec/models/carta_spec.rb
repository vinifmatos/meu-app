require 'rails_helper'

RSpec.describe Carta, type: :model do
  describe '.import_from_scryfall' do
    let(:data) do
      [
        {
          "id" => "scryfall-id-1",
          "oracle_id" => "oracle-id-1",
          "name" => "Counterspell",
          "lang" => "en",
          "released_at" => "1993-08-05",
          "rarity" => "common",
          "type_line" => "Instant",
          "legalities" => {
            "standard" => "not_legal",
            "modern" => "legal",
            "pauper" => "legal",
            "commander" => "legal",
            "vintage" => "restricted"
          }
        }
      ]
    end

    it 'salva as legalidades da carta' do
      Carta.import_from_scryfall(data)
      carta = Carta.find_by(scryfall_id: "scryfall-id-1")
      
      expect(carta.legalities).to be_present
      expect(carta.legalities['pauper']).to eq('legal')
      expect(carta.legalities['vintage']).to eq('restricted')
    end
  end
end
