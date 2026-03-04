require "rails_helper"

RSpec.describe "Api::V1::Decks::Cartas", type: :request do
  let!(:deck) { create(:deck) }
  let!(:carta) { create(:carta) }
  let(:headers) { { "Accept" => "application/json" } }

  describe "POST /api/v1/decks/:deck_id/cartas" do
    let(:valid_params) do
      {
        data: {
          deck_carta: {
            carta_id: carta.id,
            quantidade: 2
          }
        }
      }
    end

    it "adiciona uma carta ao deck" do
      expect {
        post api_v1_deck_cartas_path(deck), params: valid_params, headers: headers
      }.to change(DeckCarta, :count).by(1)

      expect(response).to have_http_status(:success)
      expect(deck.deck_cartas.first.quantidade).to eq(2)
    end

    it "incrementa a quantidade se a carta já existir no deck" do
      create(:deck_carta, deck: deck, carta: carta, quantidade: 1)

      expect {
        post api_v1_deck_cartas_path(deck), params: valid_params, headers: headers
      }.not_to change(DeckCarta, :count)

      expect(deck.deck_cartas.find_by(carta_id: carta.id).quantidade).to eq(3)
    end
  end

  describe "DELETE /api/v1/decks/:deck_id/cartas/:id" do
    let!(:deck_carta) { create(:deck_carta, deck: deck, carta: carta, quantidade: 2) }

    it "decrementa a quantidade da carta no deck" do
      delete api_v1_deck_carta_path(deck, carta), headers: headers

      expect(response).to have_http_status(:success)
      expect(deck_carta.reload.quantidade).to eq(1)
    end

    it "remove a carta se a quantidade chegar a zero ou se for pedido para remover tudo" do
      delete api_v1_deck_carta_path(deck, carta), params: { tudo: "true" }, headers: headers

      expect(response).to have_http_status(:success)
      expect(DeckCarta.exists?(deck_carta.id)).to be_falsey
    end
  end
end
