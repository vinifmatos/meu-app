class JsonKeyTransformer
  def initialize(app)
    @app = app
  end

  def call(env)
    transform_request(env)
    status, headers, response = @app.call(env)
    transform_response(status, headers, response)
  end

  private

  def transform_request(env)
    return unless transformable_request?(env)

    request = ActionDispatch::Request.new(env)
    request.body.rewind
    body = request.body.read
    return if body.blank?

    env["action_dispatch.request.request_parameters"] = transform_hash(JSON.parse(body), :underscore)
    env["rack.input"] = StringIO.new(env["action_dispatch.request.request_parameters"].to_json)
  end

  def transform_response(status, headers, response)
    return [ status, headers, response ] unless transformable_response?(headers, response)

    body = response.body
    body = body.join if body.is_a?(Array)
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
    headers["Content-Type"]&.include?("application/json") && response.body.present?
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
  end
end
