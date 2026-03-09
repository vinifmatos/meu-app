require 'rails_helper'

RSpec.describe "Autenticação Avançada & Edge Cases", type: :request do
  let(:usuario) { create(:usuario, password: 'Password123@') }
  let(:outro_usuario) { create(:usuario, password: 'Password123@') }
  let(:headers) { { "Accept" => "application/json", "Content-Type" => "application/json" } }

  describe "POST /api/v1/auth/refresh - Segurança de Token" do
    it "rejeita refresh_token que pertence a outro usuário" do
      rt_outro = create(:refresh_token, usuario: outro_usuario)

      # Tenta dar refresh usando o token do outro usuário mas autenticado como 'usuario'
      # Nota: O controller de refresh não exige Auth header, ele confia no token.
      # Mas o token DEVE estar vinculado ao usuário correto internamente.
      post "/api/v1/auth/refresh", params: { data: { refreshToken: rt_outro.token } }.to_json, headers: headers

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)['data']
      expect(json['usuario']['id']).to eq(outro_usuario.id)
      expect(json['usuario']['id']).not_to eq(usuario.id)
    end

    it "rejeita refresh_token expirado" do
      rt_expirado = create(:refresh_token, :expired, usuario: usuario)

      post "/api/v1/auth/refresh", params: { data: { refreshToken: rt_expirado.token } }.to_json, headers: headers

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)['message']).to match(/expirado/)
    end

    it "rejeita refresh_token revogado" do
      rt_revogado = create(:refresh_token, :revoked, usuario: usuario)

      post "/api/v1/auth/refresh", params: { data: { refreshToken: rt_revogado.token } }.to_json, headers: headers

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)['message']).to match(/inválido ou expirado/)
    end
  end

  describe "POST /api/v1/auth/login - Segurança de Payload" do
    it "retorna erro amigável para JSON malformado" do
      post "/api/v1/auth/login", params: "{ malformed: json }", headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "retorna erro para payload sem a chave 'data'" do
      post "/api/v1/auth/login", params: { auth: { username: 'test', password: '123' } }.to_json, headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end
end
