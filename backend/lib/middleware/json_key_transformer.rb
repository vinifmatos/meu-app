module Middleware
  class JsonKeyTransformer
    def initialize(app)
      @app = app
    end

    def call(env)
      begin
        transform_request(env)
        transform_query_params(env)
      rescue JSON::ParserError
        return [ 400, { "Content-Type" => "application/json" }, [ { message: "JSON malformado ou inválido" }.to_json ] ]
      end

      status, headers, response = @app.call(env)
      transform_response(status, headers, response)
    end

    private

    def transform_query_params(env)
      request = Rack::Request.new(env)
      return if request.GET.empty?

      transformed_params = transform_hash(request.GET, :underscore)

      # Atualiza a query string e os parâmetros processados pelo Rack
      env["rack.request.query_hash"] = transformed_params
      env["QUERY_STRING"] = Rack::Utils.build_nested_query(transformed_params)
    end

    def transform_request(env)
      return unless transformable_request?(env)

      request = ActionDispatch::Request.new(env)
      return if request.body.nil?

      request.body.rewind
      body = request.body.read
      return if body.blank?

      env["action_dispatch.request.request_parameters"] = transform_hash(JSON.parse(body), :underscore)
      env["rack.input"] = StringIO.new(env["action_dispatch.request.request_parameters"].to_json)
    end

    def transform_response(status, headers, response)
      return [ status, headers, response ] unless transformable_response?(headers, response)

      # Normaliza o corpo da resposta para string, lidando com o fato de que pode ser um array (Rack) ou um objeto (Rails)
      body = ""
      response.each { |part| body << part }

      return [ status, headers, response ] if body.blank?

      new_body = transform_hash(JSON.parse(body), :camelize)
      new_response = [ new_body.to_json ]

      headers["Content-Length"] = new_response.first.bytesize.to_s
      [ status, headers, new_response ]
    end

    def transformable_request?(env)
      env["CONTENT_TYPE"]&.include?("application/json")
    end

    def transformable_response?(headers, response)
      headers["Content-Type"]&.include?("application/json")
    end

    def transform_hash(original_hash, method)
      original_hash.deep_transform_keys! do |key|
        case method
        when :underscore
          key.to_s.underscore.to_sym
        when :camelize
          key.to_s.camelize(:lower).to_sym
        end
      end

      original_hash.with_indifferent_access
    end
  end
end
