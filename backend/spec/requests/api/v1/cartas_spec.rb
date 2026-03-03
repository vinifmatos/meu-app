require "rails_helper"

RSpec.describe "Api::V1::Cartas", type: :request do
  let!(:cartas) { create_list(:carta, 25) }
  let!(:carta_com_faces) { create(:carta, :with_faces) }
  let(:headers) { { "Accept" => "application/json" } }

  describe "GET /api/v1/cartas" do
    it "retorna uma lista de cartas com paginação" do
      get api_v1_cartas_path, params: { page: 1, per_page: 10 }, headers: headers

      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["cartas"].size).to eq(10)
      expect(json_response["data"]["pagination"]["currentPage"]).to eq(1)
      expect(json_response["data"]["pagination"]["totalPages"]).to eq(3)
    end
  end

  describe "GET /api/v1/cartas/:id" do
    it "retorna os detalhes de uma carta" do
      get api_v1_carta_path(cartas.first), headers: headers

      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["carta"]["id"]).to eq(cartas.first.id)
      expect(json_response["data"]["carta"]["name"]).to eq(cartas.first.name)
    end

    it "retorna as faces da carta se existirem" do
      get api_v1_carta_path(carta_com_faces), headers: headers

      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["carta"]["faces"].size).to eq(2)
    end

    it "retorna 404 se a carta não for encontrada" do
      get api_v1_carta_path(id: 0), headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
