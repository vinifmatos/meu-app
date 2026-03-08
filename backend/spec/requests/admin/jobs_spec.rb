require 'rails_helper'

RSpec.describe "Admin::Jobs", type: :request do
  describe "GET /jobs" do
    it "proíbe acesso sem autenticação básica" do
      get "/jobs", headers: { "Accept" => "text/html" }
      expect(response).to have_http_status(:unauthorized)
    end

    # Nota: Em ambiente de teste, as credenciais padrão do Mission Control
    # são vazias ou precisam ser definidas. Como não definimos no application.rb,
    # o Mission Control busca em credenciais ou env vars.
  end
end
