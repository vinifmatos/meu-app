module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :autenticar_usuario!, only: :login

      def login
        auth_params = params.require(:data).require(:auth)
        usuario = Usuario.find_by(username: auth_params[:username])

        if usuario&.authenticate(auth_params[:password])
          token = Auth::TokenService.encode(user_id: usuario.id)
          render_json_success(template: nil, data: { token: token, usuario: formatar_usuario(usuario) })
        else
          render_json_error(message: "Usuário ou senha inválidos", status: :unauthorized)
        end
      end

      def refresh
        token = Auth::TokenService.encode(user_id: current_user.id)
        render_json_success(template: nil, data: { token: token, usuario: formatar_usuario(current_user) })
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
