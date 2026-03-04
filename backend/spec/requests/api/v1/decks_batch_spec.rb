require "rails_helper"

RSpec.describe "Api::V1::Decks", type: :request do
  let!(:usuario) { Usuario.find_by!(username: 'admin') }
  let(:headers) { auth_headers(usuario).merge("Accept" => "application/json") }
  let!(:cartas) { create_list(:carta, 3) }

  describe "POST /api/v1/decks" do
    let(:valid_params) do
      {
        data: {
          deck: {
            nome: "Deck com Cartas",
            formato: "pauper",
            cartas_attributes: [
              { carta_id: cartas[0].id, quantidade: 4, eh_comandante: false },
              { carta_id: cartas[1].id, quantidade: 2, eh_comandante: false }
            ]
          }
        }
      }
    end

    it "cria um novo deck e retorna status 201" do
      post api_v1_decks_path, params: valid_params, headers: headers

      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["deck"]["nome"]).to eq("Deck com Cartas")
      
      deck = Deck.last
      expect(deck.deck_cartas.count).to eq(2)
      expect(deck.deck_cartas.first.quantidade).to eq(4)
    end
  end
end
