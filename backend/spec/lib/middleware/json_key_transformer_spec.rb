require 'rails_helper'

RSpec.describe Middleware::JsonKeyTransformer do
  let(:app) { ->(env) { [ 200, { 'Content-Type' => 'application/json' }, [ { 'snake_case_key' => 'value' }.to_json ] ] } }
  let(:middleware) { described_class.new(app) }

  describe 'transformação de parâmetros da query' do
    it 'transforma chaves camelCase na query string para snake_case' do
      env = Rack::MockRequest.env_for('/api/v1/cartas?filters[typeLine]=Creature&pageNumber=1')
      middleware.call(env)

      request = Rack::Request.new(env)
      expect(request.params['filters']['type_line']).to eq('Creature')
      expect(request.params['page_number']).to eq('1')
    end
  end

  describe 'transformação do corpo da requisição' do
    it 'transforma chaves camelCase no JSON do body para snake_case' do
      body = { 'userProfile' => { 'firstName' => 'John' } }.to_json
      env = Rack::MockRequest.env_for('/api/v1/users',
        method: 'POST',
        input: body,
        'CONTENT_TYPE' => 'application/json'
      )

      middleware.call(env)

      # Verifica se os parâmetros processados pelo Rails/Rack foram alterados
      params = env['action_dispatch.request.request_parameters']
      expect(params['user_profile']['first_name']).to eq('John')
    end
  end

  describe 'transformação da resposta' do
    it 'transforma chaves snake_case na resposta para camelCase' do
      env = Rack::MockRequest.env_for('/api/v1/data')
      status, headers, response = middleware.call(env)

      expect(status).to eq(200)
      json_body = JSON.parse(response.first)
      expect(json_body).to have_key('snakeCaseKey')
      expect(json_body['snakeCaseKey']).to eq('value')
    end
  end
end
