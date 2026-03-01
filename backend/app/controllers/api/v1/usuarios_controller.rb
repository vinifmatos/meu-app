class Api::V1::UsuariosController < ApplicationController
  before_action :set_usuario, only: %i[show update destroy]

  def index
    @usuarios = Usuario.all

    render_json_success(locals: { usuarios: @usuarios })
  end

  def show
    render_json_success(locals: { usuario: @usuario })
  end

  def create
    @usuario = Usuario.create!(usuario_params)
    render_json_success(template: :show, locals: { usuario: @usuario }, message: "Usuário criado com sucesso")
  end

  def update
    @usuario.update!(usuario_params)
    render_json_success(template: :show, locals: { usuario: @usuario }, message: "Usuário atualizado com sucesso")
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
    params.require(:usuario).permit(:username, :name, :password, :password_confirmation, :role, :old_password)
  end
end
