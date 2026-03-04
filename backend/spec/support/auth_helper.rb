module AuthHelper
  def auth_headers(usuario)
    token = Auth::TokenService.encode(user_id: usuario.id)
    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :request
end
