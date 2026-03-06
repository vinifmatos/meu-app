require 'rails_helper'

RSpec.describe "Api::V1::Admin::Importacoes", type: :request do
  let(:admin) { Usuario.find_by(username: 'admin') || create(:usuario, :admin, username: 'admin') }
  let(:usuario) { create(:usuario) }
  let(:headers_admin) { auth_headers(admin).merge("Accept" => "application/json", "Content-Type" => "application/json") }
  let(:headers_usuario) { auth_headers(usuario).merge("Accept" => "application/json", "Content-Type" => "application/json") }

  describe "GET /api/v1/admin/importacoes" do
    it "proíbe acesso a não-administradores" do
      get api_v1_admin_importacoes_path, headers: headers_usuario
      expect(response).to have_http_status(:forbidden)
    end

    it "retorna a lista de importações para o admin" do
      create(:importacao_scryfall, tipo: :bulk_data, status: :concluido)
      get api_v1_admin_importacoes_path, headers: headers_admin

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      # No JsonResponseHelper, o payload fica dentro de json['data']
      # E no index.json.jbuilder, temos json.importacoes
      expect(json['data']['importacoes'].size).to be >= 1
    end
  end

  describe "POST /api/v1/admin/importacoes" do
    it "inicia uma nova importação de símbolos" do
      expect {
        post api_v1_admin_importacoes_path, params: { data: { importacao: { tipo: 'simbolos' } } }.to_json, headers: headers_admin
      }.to change(ImportacaoScryfall, :count).by(1).and have_enqueued_job(ScryfallImportJob)

      expect(response).to have_http_status(:created)
    end

    it "inicia uma nova importação de cartas" do
      expect {
        post api_v1_admin_importacoes_path, params: { data: { importacao: { tipo: 'bulk_data' }, force: true } }.to_json, headers: headers_admin
      }.to change(ImportacaoScryfall, :count).by(1).and have_enqueued_job(ScryfallImportJob)

      expect(response).to have_http_status(:created)
    end
  end

  describe "DELETE /api/v1/admin/importacoes/:id" do
    it "marca uma importação como cancelada" do
      importacao = create(:importacao_scryfall, status: :processando)

      # O helper gerado pelo Rails com a flexão atual foi api_v1_admin_importaco_path
      # Vamos usar a URL direta ou corrigir o helper.
      delete "/api/v1/admin/importacoes/#{importacao.id}", headers: headers_admin

      expect(response).to have_http_status(:success)
      expect(importacao.reload.status).to eq('cancelado')
    end
  end
end
