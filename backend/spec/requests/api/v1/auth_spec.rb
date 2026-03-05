require 'rails_helper'

RSpec.describe "Autenticação", type: :request do
  let(:usuario) { create(:usuario, password: 'password123', role: :usuario) }
  let(:admin) { create(:usuario, password: 'password123', role: :admin) }
  let(:headers) { { "Accept" => "application/json", "Content-Type" => "application/json" } }

  describe "POST /api/v1/auth/login" do
    it "retorna um token JWT válido com credenciais corretas" do
      post "/api/v1/auth/login", params: { data: { auth: { username: usuario.username, password: 'password123' } } }.to_json, headers: headers
      
      expect(response).to have_http_status(:success)
      expect(json_data['token']).to be_present
      expect(json_data['usuario']['username']).to eq(usuario.username)
    end

    it "retorna erro com credenciais inválidas" do
      post "/api/v1/auth/login", params: { data: { auth: { username: usuario.username, password: 'wrong' } } }.to_json, headers: headers
      
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/auth/refresh" do
    it "retorna um novo token quando o refresh token é válido" do
      # Criamos um refresh token real para o usuário
      rt = create(:refresh_token, usuario: usuario)
      
      # Enviamos via camelCase (refreshToken) no body
      post "/api/v1/auth/refresh", params: { data: { refreshToken: rt.token } }.to_json, headers: headers
      
      expect(response).to have_http_status(:success)
      expect(json_data['token']).to be_present
      # A resposta deve vir com refreshToken (camelCase) devido ao middleware
      expect(json_data['refreshToken']).to be_present
      expect(json_data['refreshToken']).not_to eq(rt.token)
    end

    it "retorna 401 quando o refresh token é inválido" do
      post "/api/v1/auth/refresh", params: { data: { refreshToken: 'token-invalido' } }.to_json, headers: headers
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "Whitelist e Proteção de Rotas" do
    it "permite acesso público à listagem de cartas" do
      get "/api/v1/cartas", headers: headers
      expect(response).to have_http_status(:success)
    end

    it "bloqueia acesso ao editor de deck sem token" do
      # Tentativa de criar deck sem token
      post "/api/v1/decks", params: { data: { deck: { nome: 'Novo' } } }.to_json, headers: headers
      expect(response).to have_http_status(:unauthorized)
    end

    it "permite acesso ao editor de deck com token válido" do
      headers_auth = auth_headers(usuario).merge(headers)
      
      # Criamos um deck real para não falhar no salvamento
      post "/api/v1/decks", params: { data: { deck: { nome: 'Novo Deck TDD', formato: 'pauper' } } }.to_json, headers: headers_auth
      expect(response).to have_http_status(:success)
    end
  end

  describe "Acesso Administrativo" do
    it "bloqueia acesso à listagem de usuários para usuários comuns" do
      headers_auth = auth_headers(usuario).merge(headers)
      
      get "/api/v1/usuarios", headers: headers_auth
      expect(response).to have_http_status(:forbidden)
    end

    it "permite acesso à listagem de usuários para administradores" do
      headers_auth = auth_headers(admin).merge(headers)
      
      get "/api/v1/usuarios", headers: headers_auth
      expect(response).to have_http_status(:success)
    end
  end
end

def json_data
  JSON.parse(response.body)['data']
end
