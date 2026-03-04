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

    it "filtra as cartas pelo nome" do
      carta_especifica = create(:carta, name: "Cartinha Especial")
      get api_v1_cartas_path, params: { filters: { name: "Especial" } }, headers: headers

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response["data"]["cartas"].any? { |c| c["name"] == carta_especifica.name }).to be_truthy
    end

    it "filtra as cartas pelo type_line" do
      create(:carta, name: "Atog", type_line: "Creature — Atog", oracle_id: "atog-id")
      create(:carta, name: "Island", type_line: "Basic Land — Island", oracle_id: "island-id")

      # Simulamos o envio via camelCase vindo do frontend
      get "/api/v1/cartas?filters[typeLine]=Creature", headers: headers

      json_response = JSON.parse(response.body)
      cartas_retornadas = json_response["data"]["cartas"]

      p cartas_retornadas.find { |c| !c["typeLine"]&.include?("Creature") }

      expect(cartas_retornadas.any?).to be_truthy
      expect(cartas_retornadas.all? { |c| c["typeLine"]&.include?("Creature") }).to be_truthy
    end

    it "filtra as cartas pelas cores (inclusão)" do
      create(:carta, name: "Bolt", colors: [ "R" ])
      create(:carta, name: "Counterspell", colors: [ "U" ])
      create(:carta, name: "Izzet Spell", colors: [ "U", "R" ])

      # Busca cartas que tenham Vermelho E Azul
      get api_v1_cartas_path, params: { filters: { colors: [ "U", "R" ] } }, headers: headers

      json_response = JSON.parse(response.body)
      nomes = json_response["data"]["cartas"].map { |c| c["name"] }
      expect(nomes).to include("Izzet Spell")
      expect(nomes).not_to include("Bolt")
      expect(nomes).not_to include("Counterspell")
    end

    it "filtra as cartas pela identidade de cor (contido em)" do
      create(:carta, name: "Bolt", color_identity: [ "R" ])
      create(:carta, name: "Counterspell", color_identity: [ "U" ])
      create(:carta, name: "White Spell", color_identity: [ "W" ])

      # Para um comandante Izzet (UR), Bolt e Counterspell são legais, White Spell não.
      get api_v1_cartas_path, params: { filters: { color_identity: [ "U", "R" ] } }, headers: headers

      json_response = JSON.parse(response.body)
      nomes = json_response["data"]["cartas"].map { |c| c["name"] }
      expect(nomes).to include("Bolt")
      expect(nomes).to include("Counterspell")
      expect(nomes).not_to include("White Spell")
    end

    it "ordena as cartas" do
      create(:carta, name: "Abacaxi")
      create(:carta, name: "Zebra")
      get api_v1_cartas_path, params: { sort: "name" }, headers: headers

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      p json_response["data"]["cartas"].first["name"]
      expect(json_response["data"]["cartas"].first["name"]).to eq("Abacaxi")
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
