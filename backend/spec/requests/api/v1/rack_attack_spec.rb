require 'rails_helper'

RSpec.describe "Rack::Attack", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.enabled = true
    BanimentoIp.delete_all
    Rails.cache.clear
  end

  after do
    Rack::Attack.enabled = false
  end

  let(:login_params) { { data: { auth: { username: 'test', password: '123' } } }.to_json }
  let(:headers) { { 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json' } }

  describe "Throttle login attempts" do
    it "throttles by IP after 5 attempts to login path" do
      5.times do
        post api_v1_auth_login_path, params: login_params, headers: headers
      end

      post api_v1_auth_login_path, params: login_params, headers: headers
      expect(response).to have_http_status(:too_many_requests)
    end
  end

  describe "Fail2Ban & Permanent Ban" do
    it "permanently bans IP after accessing a malicious path (.env)" do
      # 1ª tentativa: Acessa caminho crítico
      get "/.env"

      # Verifica se foi criado no banco
      expect(BanimentoIp.exists?(ip: '127.0.0.1')).to be_truthy

      # 2ª tentativa: Deve ser bloqueado permanentemente (403)
      get "/"
      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['message']).to include("permanentemente bloqueado")
    end

    it "bans IP after multiple throttle violations in login" do
      # Simula 3 ciclos de throttle
      3.times do
        # Esgota o throttle (5 tentativas)
        5.times { post api_v1_auth_login_path, params: login_params, headers: headers }
        # O 6º post deve ser bloqueado por throttle (429)
        post api_v1_auth_login_path, params: login_params, headers: headers
        expect(response.status).to eq(429)

        # Avança no tempo para limpar o throttle mas o Fail2Ban continua contando as violações
        travel 21.seconds
      end

      # Após a 3ª violação de throttle, o IP deve ser banido (403)
      get "/"
      expect(response).to have_http_status(:forbidden)
    end
  end
end
