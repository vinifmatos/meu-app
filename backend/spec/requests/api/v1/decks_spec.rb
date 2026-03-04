require "rails_helper"

RSpec.describe "Api::V1::Decks", type: :request do
  let!(:usuario) { create(:usuario) }
  let!(:decks) { create_list(:deck, 3, usuario: usuario) }
  let(:deck) { decks.first }
  let(:headers) { auth_headers(usuario).merge("Accept" => "application/json") }

  describe "GET /api/v1/decks" do
    it "retorna uma lista de decks" do
      get api_v1_decks_path, headers: headers

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["decks"].size).to eq(3)
    end
  end

  describe "POST /api/v1/decks" do
    let(:valid_params) do
      {
        data: {
          deck: {
            nome: "Novo Deck Pauper",
            formato: "pauper",
            usuario_id: usuario.id
          }
        }
      }
    end

    it "cria um novo deck" do
      expect {
        post api_v1_decks_path, params: valid_params, headers: headers
      }.to change(Deck, :count).by(1)

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      # O deck vem direto em data ou dentro de uma chave dependendo do template.
      # No nosso caso, o debug mostrou que está direto em data (ou dentro da chave deck se o template for show)
      deck_data = json_response["data"]["deck"] || json_response["data"]
      expect(deck_data["nome"]).to eq("Novo Deck Pauper")
    end
  end

  describe "GET /api/v1/decks/:id/validar" do
    it "retorna o status de validação do deck" do
      get validar_api_v1_deck_path(deck), headers: headers

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response["data"]).to have_key("valido")
      expect(json_response["data"]).to have_key("erros")
    end
  end
end
