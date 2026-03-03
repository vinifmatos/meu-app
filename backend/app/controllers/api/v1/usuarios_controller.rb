class Api::V1::UsuariosController < ApplicationController
  before_action :set_usuario, only: %i[show update destroy]

  def index
    @usuarios = Usuario.all.order(:id).page(params[:page]).per(params[:per_page] || 20)

    render_json_success(template: "api/v1/usuarios/index", locals: { usuarios: @usuarios })
  end

  def show
    render_json_success(template: "api/v1/usuarios/show", locals: { usuario: @usuario })
  end

  def create
    @usuario = Usuario.create!(usuario_params)
    render_json_success(template: "api/v1/usuarios/show", locals: { usuario: @usuario }, message: "Usuário criado com sucesso")
  end

  def update
    @usuario.update!(usuario_params)
    render_json_success(template: "api/v1/usuarios/show", locals: { usuario: @usuario }, message: "Usuário atualizado com sucesso")
  end

  def destroy
    @usuario.destroy!
    render_json_success(status: :no_content)
  end

  private

  def set_usuario
    @usuario = Usuario.find(params[:id])
  end

  def usuario_params
    params.require(:data).require(:usuario).permit(:username, :nome, :password, :password_confirmation, :role, :old_password)
  end
end
