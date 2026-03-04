require "rails_helper"

RSpec.describe "Api::V1::Decks", type: :request do
  let!(:usuario) { create(:usuario) }
  let!(:decks) { create_list(:deck, 3, usuario: usuario) }
  let(:deck) { decks.first }
  let(:headers) { auth_headers(usuario).merge("Accept" => "application/json") }

  describe "GET /api/v1/decks" do
    let!(:outro_usuario) { create(:usuario) }
    let!(:outros_decks) { create_list(:deck, 2, usuario: outro_usuario) }

    it "retorna todos os decks da comunidade por padrão" do
      get api_v1_decks_path, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      # 3 do usuario + 2 do outro_usuario
      expect(json_response["data"]["decks"].size).to eq(5)
    end

    it "retorna apenas os decks do usuário autenticado quando filtrado" do
      get api_v1_decks_path, params: { meus: 'true' }, headers: headers

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["decks"].size).to eq(3)
      
      # Valida que todos os decks retornados pertencem de fato ao usuário
      ids_retornados = json_response["data"]["decks"].map { |d| d["id"] }
      expect(ids_retornados).to match_array(decks.map(&:id))
    end
  end

  describe "POST /api/v1/decks" do
    let(:valid_params) do
      {
        data: {
          deck: {
            nome: "Novo Deck Pauper",
            formato: "pauper"
          }
        }
      }
    end

    it "cria um novo deck vinculado ao usuário autenticado" do
      expect {
        post api_v1_decks_path, params: valid_params, headers: headers
      }.to change(usuario.decks, :count).by(1)

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["deck"]["nome"]).to eq("Novo Deck Pauper")
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
