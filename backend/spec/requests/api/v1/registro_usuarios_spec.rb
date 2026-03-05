require 'rails_helper'

RSpec.describe "Api::V1::RegistroUsuarios", type: :request do
  let(:valid_attributes) do
    {
      username: 'testuser',
      nome: 'Test User',
      email: 'test@example.com',
      password: 'Password123@',
      password_confirmation: 'Password123@'
    }
  end

  describe "POST /api/v1/registro_usuarios" do
    context "com parâmetros válidos" do
      it "cria um novo Usuario" do
        expect {
          post api_v1_registro_usuarios_path, params: { usuario: valid_attributes }
        }.to change(Usuario, :count).by(1)
      end

      it "retorna um status de criado" do
        post api_v1_registro_usuarios_path, params: { usuario: valid_attributes }
        expect(response).to have_http_status(:created)
      end

      it "envia um email de confirmação" do
        include ActiveJob::TestHelper
        perform_enqueued_jobs do
          expect {
            post api_v1_registro_usuarios_path, params: { usuario: valid_attributes }
          }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end
    end

    context "com parâmetros inválidos" do
      it "retorna unprocessable_entity" do
        post api_v1_registro_usuarios_path, params: { usuario: { username: '' } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/registro_usuarios/confirmar (Segurança)" do
    let!(:usuario) { create(:usuario, :unconfirmed) }

    it "confirma o usuário com um token válido" do
      get confirmar_api_v1_registro_usuarios_path(token: usuario.confirmation_token)
      usuario.reload
      expect(usuario.confirmed?).to be_truthy
      expect(response).to have_http_status(:ok)
    end

    it "retorna 404 para token inexistente" do
      get confirmar_api_v1_registro_usuarios_path(token: 'token_nao_existe')
      expect(response).to have_http_status(:not_found)
    end

    it "retorna 404 para requisição sem token" do
      get confirmar_api_v1_registro_usuarios_path
      expect(response).to have_http_status(:not_found)
    end
  end
end
