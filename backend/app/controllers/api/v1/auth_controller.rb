module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :carregar_usuario_atual, only: [:login, :refresh]
      skip_before_action :autenticar_usuario!, only: [:login, :refresh]

      def login
        auth_params = params.require(:data).require(:auth)
        usuario = Usuario.find_by(username: auth_params[:username])

        # Proteção básica contra brute-force (simulada por cache)
        cache_key = "login_attempts:#{request.remote_ip}"
        attempts = Rails.cache.read(cache_key).to_i
        
        if attempts >= 5
          return render_json_error(message: "Muitas tentativas falhas. Tente novamente mais tarde.", status: :too_many_requests)
        end

        if usuario&.authenticate(auth_params[:password])
          unless usuario.confirmed?
            return render_json_error(message: "Sua conta ainda não foi ativada. Verifique seu e-mail.", status: :forbidden)
          end

          Rails.cache.delete(cache_key) # Reset attempts on success

          access_token = Auth::TokenService.encode(user_id: usuario.id)
          refresh_token = usuario.refresh_tokens.create!

          render_json_success(template: nil, data: { 
            token: access_token, 
            refresh_token: refresh_token.token,
            usuario: formatar_usuario(usuario) 
          })
        else
          Rails.cache.write(cache_key, attempts + 1, expires_in: 15.minutes)
          render_json_error(message: "Usuário ou senha inválidos", status: :unauthorized)
        end
      end

      def refresh
        refresh_token_param = params.dig(:data, :refresh_token)
        
        unless refresh_token_param
          return render_json_error(message: "Refresh token ausente", status: :unauthorized)
        end

        rt = RefreshToken.find_by(token: refresh_token_param)

        if rt && rt.valid_token?
          # Revoga o token atual e gera um novo (Rotação de Token)
          rt.revoke!
          usuario = rt.usuario
          
          novo_access_token = Auth::TokenService.encode(user_id: usuario.id)
          novo_refresh_token = usuario.refresh_tokens.create!

          render_json_success(template: nil, data: { 
            token: novo_access_token, 
            refresh_token: novo_refresh_token.token,
            usuario: formatar_usuario(usuario) 
          })
        else
          render_json_error(message: "Refresh token inválido ou expirado", status: :unauthorized)
        end
      end

      def logout
        refresh_token_param = params.dig(:data, :refresh_token)
        
        if refresh_token_param
          rt = current_user.refresh_tokens.find_by(token: refresh_token_param)
          rt&.revoke!
        end

        render_json_success(message: "Logout realizado com sucesso", template: nil, data: {})
      end

      private

      def formatar_usuario(usuario)
        {
          id: usuario.id,
          username: usuario.username,
          nome: usuario.nome,
          role: usuario.role
        }
      end
    end
  end
end
