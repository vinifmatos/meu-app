class Rack::Attack
  ### Configure Cache ###
  # Rack::Attack uses Rails.cache by default if it's defined.

  ### Permanente Blocklist (Banco de Dados) ###
  # Bloqueia IPs que estão na nossa tabela de banimentos permanentes.
  # Usamos Rails.cache para não bater no banco em TODA requisição.
  blocklist('permanent/ban') do |req|
    # Verifica no cache se o IP está banido (cache de 5 minutos para performance)
    banido = Rails.cache.fetch("permanent_ban:#{req.ip}", expires_in: 5.minutes) do
      BanimentoIp.exists?(ip: req.ip)
    end
    banido
  end

  ### Fail2Ban Configuration ###
  # Bloqueia IPs que tentam acessar caminhos maliciosos conhecidos.
  blocklist('fail2ban/scanners') do |req|
    Fail2Ban.filter("scanner:#{req.ip}", maxretry: 1, findtime: 1.minute, bantime: 1.hour) do
      malicioso = req.path.include?('.php') || 
                  req.path.include?('.env') || 
                  req.path.include?('wp-admin') || 
                  req.path.include?('setup.cgi')
      
      if malicioso
        # Registra no banco para banimento permanente por ser violação grave
        BanimentoIp.find_or_create_by(ip: req.ip) do |b|
          b.motivo = "Tentativa de acesso a caminho crítico: #{req.path}"
        end
        # Limpa cache do IP para o blocklist permanente pegar imediatamente
        Rails.cache.write("permanent_ban:#{req.ip}", true, expires_in: 5.minutes)
      end
      malicioso
    end
  end

  # Bloqueia IPs que atingem o limite de login muitas vezes
  blocklist('fail2ban/bruteforce') do |req|
    Fail2Ban.filter("bruteforce:#{req.ip}", maxretry: 3, findtime: 10.minutes, bantime: 24.hours) do
      false
    end
  end

  ### Throttle Spammy Clients ###
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  ### Throttle Login Attempts ###
  throttle('login/ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      req.ip
    end
  end

  # Throttle por username (JSON body)
  throttle('login/username', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/login' && req.post? && req.content_type == 'application/json'
      begin
        body = req.body.read
        req.body.rewind
        
        parsed_params = JSON.parse(body)
        if parsed_params['data'] && parsed_params['data']['auth']
          parsed_params['data']['auth']['username'].to_s.downcase.gsub(/\s+/, "")
        end
      rescue
        nil
      end
    end
  end

  ### Custom Response ###
  self.throttled_responder = lambda do |request|
    matched = request.env['rack.attack.matched']
    
    if matched == 'login/ip'
      Fail2Ban.filter("bruteforce:#{request.ip}", maxretry: 3, findtime: 10.minutes, bantime: 24.hours) { true }
    end

    [ 429, 
      { 'Content-Type' => 'application/json' }, 
      [{ message: "Muitas tentativas. Tente novamente mais tarde." }.to_json]
    ]
  end

  ### Custom Blocklist Response ###
  self.blocklisted_responder = lambda do |request|
    # Verifica se o IP está banido permanentemente para retornar mensagem específica
    is_permanent = BanimentoIp.exists?(ip: request.ip)
    mensagem = is_permanent ? "Seu acesso foi permanentemente bloqueado por violação de segurança." : "Acesso bloqueado por comportamento malicioso."

    [ 403, 
      { 'Content-Type' => 'application/json' }, 
      [{ message: mensagem }.to_json]
    ]
  end
end
