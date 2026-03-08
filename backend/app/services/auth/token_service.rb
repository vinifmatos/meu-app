module Auth
  class TokenService
    SECRET_KEY = Rails.application.secret_key_base
    ALGORITHM = "HS256"
    EXPIRATION = 3.hours

    def self.encode(payload)
      payload[:exp] = EXPIRATION.from_now.to_i
      JWT.encode(payload, SECRET_KEY, ALGORITHM)
    end

    def self.decode(token)
      body = JWT.decode(token, SECRET_KEY, true, { algorithm: ALGORITHM })[0]
      HashWithIndifferentAccess.new(body)
    rescue JWT::ExpiredSignature, JWT::DecodeError
      nil
    end
  end
end
