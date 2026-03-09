require 'rails_helper'

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/login (Segurança)" do
    let(:usuario) { create(:usuario, password: 'Password123@') }
    let(:usuario_nao_confirmado) { create(:usuario, :unconfirmed, password: 'Password123@') }

    it "retorna 403 Forbidden para usuário não confirmado" do
      post api_v1_auth_login_path, params: { data: { auth: { username: usuario_nao_confirmado.username, password: 'Password123@' } } }
      expect(response).to have_http_status(:forbidden)

      json = JSON.parse(response.body)
      expect(json['message']).to eq('Sua conta ainda não foi ativada. Verifique seu e-mail.')
    end

    it "permite o login para usuário confirmado" do
      post api_v1_auth_login_path, params: { data: { auth: { username: usuario.username, password: 'Password123@' } } }
      expect(response).to have_http_status(:ok)
    end
  end
end
