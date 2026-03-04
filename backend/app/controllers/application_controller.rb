class ApplicationController < ActionController::API
  include JsonResponseHelper

  before_action :autenticar_usuario!

  attr_reader :current_user

  private

  def autenticar_usuario!
    header = request.headers['Authorization']
    token = header.split(' ').last if header.present?
    
    payload = Auth::TokenService.decode(token) if token
    
    if payload
      @current_user = Usuario.find_by(id: payload[:user_id])
    end

    render_json_error(message: "Não autenticado", status: :unauthorized) unless @current_user
  end

  def exige_admin!
    unless @current_user&.admin?
      render_json_error(message: "Acesso negado", status: :forbidden)
    end
  end
end
