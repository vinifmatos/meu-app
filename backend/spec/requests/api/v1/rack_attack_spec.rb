require 'rails_helper'

RSpec.describe "Rack::Attack", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before do
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.enabled = true
  end

  after do
    Rack::Attack.enabled = false
  end

  describe "Throttle login attempts" do
    let(:usuario) { create(:usuario) }
    let(:login_params) do
      {
        data: {
          auth: {
            username: usuario.username,
            password: 'wrong_password'
          }
        }
      }
    end

    it "throttles by IP after 5 attempts" do
      5.times do
        post api_v1_auth_login_path, params: login_params
        expect(response).to have_http_status(:unauthorized)
      end

      post api_v1_auth_login_path, params: login_params
      expect(response).to have_http_status(:too_many_requests)
      
      json = JSON.parse(response.body)
      expect(json['message']).to eq("Muitas tentativas. Tente novamente mais tarde.")
    end

    it "resets throttle after period" do
      5.times { post api_v1_auth_login_path, params: login_params }
      expect(post api_v1_auth_login_path, params: login_params).to eq(429)

      travel_to(21.seconds.from_now) do
        post api_v1_auth_login_path, params: login_params
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
