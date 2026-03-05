module Api
  module V1
    class RegistroUsuariosController < ApplicationController
      skip_before_action :carregar_usuario_atual
      skip_before_action :autenticar_usuario!

      def create
        @usuario = Usuario.new(usuario_params)

        if @usuario.save
          UsuarioMailer.confirmacao_email(@usuario).deliver_later
          render_json_success(message: "Usuário registrado com sucesso. Verifique seu e-mail para confirmar a conta.", status: :created, template: nil, data: { usuario: { id: @usuario.id, username: @usuario.username } })
        else
          render_json_error(message: "Erro ao registrar usuário", validation_errors: @usuario.errors, status: :unprocessable_content)
        end
      end

      def confirmar
        @usuario = Usuario.find_by!(confirmation_token: params[:token])

        if @usuario.confirm!
          render_json_success(message: "Conta confirmada com sucesso!", template: nil, data: {})
        else
          render_json_error(message: "Erro ao confirmar conta", status: :unprocessable_content)
        end
      rescue ActiveRecord::RecordNotFound
        render_json_error(message: "Token de confirmação inválido ou expirado", status: :not_found)
      end

      private

      def usuario_params
        params.require(:usuario).permit(:username, :nome, :email, :password, :password_confirmation)
      end
    end
  end
end
