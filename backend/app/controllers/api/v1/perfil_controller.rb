module Api
  module V1
    class PerfilController < ApplicationController
      def show
        render_json_success(template: nil, data: { usuario: current_user_data })
      end

      def update
        if params[:usuario][:password].present?
          update_password
        elsif params[:usuario][:email].present? && params[:usuario][:email] != @current_user.email
          update_email
        else
          update_basic_info
        end
      end

      private

      def update_basic_info
        if @current_user.update(usuario_params.except(:email, :password, :password_confirmation, :current_password))
          render_json_success(message: "Perfil atualizado com sucesso", template: nil, data: { usuario: current_user_data })
        else
          render_json_error(message: "Erro ao atualizar perfil", validation_errors: @current_user.errors)
        end
      end

      def update_password
        unless @current_user.authenticate(params[:usuario][:current_password])
          return render_json_error(message: "Senha atual incorreta", status: :unprocessable_content)
        end

        if @current_user.update(password: params[:usuario][:password], password_confirmation: params[:usuario][:password_confirmation])
          render_json_success(message: "Senha atualizada com sucesso", template: nil, data: { usuario: current_user_data })
        else
          render_json_error(message: "Erro ao atualizar senha", validation_errors: @current_user.errors)
        end
      end

      def update_email
        @current_user.unconfirmed_email = params[:usuario][:email]
        @current_user.generate_confirmation_token
        
        if @current_user.save(validate: false)
          UsuarioMailer.confirmacao_email(@current_user).deliver_later
          render_json_success(message: "Um e-mail de confirmação foi enviado para o novo endereço. A alteração será efetivada após a confirmação.", template: nil, data: { usuario: current_user_data })
        else
          render_json_error(message: "Erro ao atualizar e-mail", validation_errors: @current_user.errors)
        end
      end

      def current_user_data
        {
          id: @current_user.id,
          username: @current_user.username,
          email: @current_user.email,
          nome: @current_user.nome,
          unconfirmed_email: @current_user.unconfirmed_email,
          created_at: @current_user.created_at
        }
      end

      def usuario_params
        params.require(:usuario).permit(:nome, :email, :password, :password_confirmation, :current_password)
      end
    end
  end
end
