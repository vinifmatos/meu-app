require 'rails_helper'

RSpec.describe "Autenticação", type: :request do
  let(:usuario) { create(:usuario, password: 'password123', role: :usuario) }
  let(:admin) { create(:usuario, password: 'password123', role: :admin) }
  let(:headers) { { "Accept" => "application/json" } }

  describe "POST /api/v1/auth/login" do
    it "retorna um token JWT válido com credenciais corretas" do
      post "/api/v1/auth/login", params: { data: { auth: { username: usuario.username, password: 'password123' } } }, headers: headers
      
      expect(response).to have_http_status(:success)
      expect(json_data['token']).to be_present
      expect(json_data['usuario']['username']).to eq(usuario.username)
    end

    it "retorna erro com credenciais inválidas" do
      post "/api/v1/auth/login", params: { data: { auth: { username: usuario.username, password: 'wrong' } } }, headers: headers
      
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/auth/refresh" do
    it "retorna um novo token quando o token atual é válido" do
      token = Auth::TokenService.encode(user_id: usuario.id)
      headers_auth = headers.merge("Authorization" => "Bearer #{token}")
      
      # Simulamos a passagem de tempo para garantir tokens diferentes
      Timecop.travel(1.minute.from_now) do
        post "/api/v1/auth/refresh", headers: headers_auth
        
        expect(response).to have_http_status(:success)
        expect(json_data['token']).to be_present
        expect(json_data['token']).not_to eq(token)
      end
    end
  end

  describe "Whitelist e Proteção de Rotas" do
    it "permite acesso público à listagem de cartas" do
      get "/api/v1/cartas", headers: headers
      expect(response).to have_http_status(:success)
    end

    it "bloqueia acesso ao editor de deck sem token" do
      # Tentativa de criar deck sem token
      post "/api/v1/decks", params: { data: { deck: { nome: 'Novo' } } }, headers: headers
      expect(response).to have_http_status(:unauthorized)
    end

    it "permite acesso ao editor de deck com token válido" do
      token = Auth::TokenService.encode(user_id: usuario.id)
      headers_auth = headers.merge("Authorization" => "Bearer #{token}")
      
      # Criamos um deck real para não falhar no salvamento
      post "/api/v1/decks", params: { data: { deck: { nome: 'Novo Deck TDD', formato: 'pauper' } } }, headers: headers_auth
      expect(response).to have_http_status(:success)
    end
  end

  describe "Acesso Administrativo" do
    it "bloqueia acesso à listagem de usuários para usuários comuns" do
      token = Auth::TokenService.encode(user_id: usuario.id)
      headers_auth = headers.merge("Authorization" => "Bearer #{token}")
      
      get "/api/v1/usuarios", headers: headers_auth
      expect(response).to have_http_status(:forbidden)
    end

    it "permite acesso à listagem de usuários para administradores" do
      token = Auth::TokenService.encode(user_id: admin.id)
      headers_auth = headers.merge("Authorization" => "Bearer #{token}")
      
      get "/api/v1/usuarios", headers: headers_auth
      expect(response).to have_http_status(:success)
    end
  end
end

def json_data
  JSON.parse(response.body)['data']
end
