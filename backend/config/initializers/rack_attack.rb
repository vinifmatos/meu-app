class Rack::Attack
  ### Configure Cache ###
  # Rack::Attack uses Rails.cache by default if it's defined.
  # If you want to use a different cache, you can configure it here:
  # Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  ### Throttle Spammy Clients ###
  # Throttle all requests by IP (60req/sec)
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  ### Throttle Login Attempts ###
  # Throttle POST requests to /api/v1/auth/login by IP
  # Key: "login/ip:#{req.ip}"
  throttle('login/ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      req.ip
    end
  end

  # Throttle POST requests to /api/v1/auth/login by username
  # Key: "login/username:#{req.params['data']['auth']['username']}"
  throttle('login/username', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      # Tentamos extrair o username do body JSON
      begin
        body = JSON.parse(req.body.string)
        body.dig('data', 'auth', 'username').to_s.downcase.gsub(/\s+/, "")
      rescue
        nil
      end
    end
  end

  ### Custom Response ###
  self.throttled_responder = lambda do |request_env|
    [ 429,  # status
      { 'Content-Type' => 'application/json' },   # headers
      [{ message: "Muitas tentativas. Tente novamente mais tarde." }.to_json] # body
    ]
  end
end
