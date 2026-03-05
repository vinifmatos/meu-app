require 'rails_helper'

RSpec.describe "Api::V1::Auth (Segurança Adicional)", type: :request do
  let(:usuario) { create(:usuario, password: 'Password123@') }
  let(:headers) { auth_headers(usuario) }

  describe "Refresh Tokens & Logout" do
    it "realiza o login retornando access_token e refresh_token" do
      post api_v1_auth_login_path, params: { data: { auth: { username: usuario.username, password: 'Password123@' } } }
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['data']['token']).to be_present
      expect(json['data']['refreshToken']).to be_present
    end

    it "permite renovar o token com um refresh_token válido" do
      refresh_token = usuario.refresh_tokens.create!

      post api_v1_auth_refresh_path, params: { data: { refresh_token: refresh_token.token } }
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['data']['token']).to be_present
      expect(json['data']['refreshToken']).to be_present
      expect(json['data']['refreshToken']).not_to eq(refresh_token.token) # Deve rotacionar
      
      expect(refresh_token.reload).to be_revoked
    end

    it "rejeita refresh_token inválido ou revogado" do
      refresh_token = usuario.refresh_tokens.create!(revoked_at: Time.current)

      post api_v1_auth_refresh_path, params: { data: { refresh_token: refresh_token.token } }
      expect(response).to have_http_status(:unauthorized)
    end

    it "revoga o refresh_token no logout" do
      refresh_token = usuario.refresh_tokens.create!

      delete api_v1_auth_logout_path, 
             params: { data: { refresh_token: refresh_token.token } }, 
             headers: headers

      expect(response).to have_http_status(:ok)
      expect(refresh_token.reload).to be_revoked
    end
  end
end
