class ApplicationController < ActionController::API
  include JsonResponseHelper

  before_action :carregar_usuario_atual
  before_action :autenticar_usuario!

  attr_reader :current_user

  private

  def carregar_usuario_atual
    header = request.headers["Authorization"]
    token = header.split(" ").last if header.present?

    payload = Auth::TokenService.decode(token) if token

    if payload
      @current_user = Usuario.find_by(id: payload[:user_id])
    end
  end

  def autenticar_usuario!
    render_json_error(message: "Não autenticado", status: :unauthorized) unless @current_user
  end

  def exige_admin!
    unless @current_user&.admin?
      render_json_error(message: "Acesso negado", status: :forbidden)
    end
  end
end
