require "rails_helper"

RSpec.describe "Api::V1::Usuarios", type: :request do
  let!(:admin) { Usuario.find_by(username: 'admin') || create(:usuario, :admin, username: 'admin') }
  let!(:usuarios) { create_list(:usuario, 5) }
  let(:usuario) { usuarios.first }
  let(:headers) { auth_headers(admin).merge("Accept" => "application/json") }

  describe "GET /api/v1/usuarios" do
    it "retorna uma lista de usuários" do
      get api_v1_usuarios_path, headers: headers

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      # 5 (create_list) + 1 (admin) = 6
      expect(json_response["data"]["usuarios"].size).to eq(6)
    end
  end

  describe "POST /api/v1/usuarios" do
    let(:valid_params) do
      {
        data: {
          usuario: {
            nome: "Novo Usuário",
            username: "novousuario",
            email: "novousuario@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }
      }
    end

    it "cria um novo usuário" do
      expect {
        post api_v1_usuarios_path, params: valid_params, headers: headers
      }.to change(Usuario, :count).by(1)

      expect(response).to have_http_status(:success)
      expect(Usuario.last.role).to eq("usuario")
    end
  end

  describe "PATCH /api/v1/usuarios/:id" do
    let(:update_params) do
      {
        data: {
          usuario: {
            nome: "Nome Atualizado"
          }
        }
      }
    end

    it "atualiza um usuário existente" do
      patch api_v1_usuario_path(usuario), params: update_params, headers: headers

      expect(response).to have_http_status(:success)
      expect(usuario.reload.nome).to eq("Nome Atualizado")
    end
  end

  describe "Proteção Mass Assignment - role" do
    it "impede a alteração do role via criação" do
      params = {
        data: {
          usuario: {
            nome: "Hacker",
            username: "hacker",
            email: "hacker@example.com",
            password: "password123",
            password_confirmation: "password123",
            role: "admin"
          }
        }
      }

      post api_v1_usuarios_path, params: params, headers: headers

      expect(response).to have_http_status(:success)
      novo_usuario = Usuario.find_by(username: "hacker")
      expect(novo_usuario.role).to eq("usuario")
    end

    it "impede a alteração do role via atualização" do
      patch api_v1_usuario_path(usuario),
            params: { data: { usuario: { role: "admin" } } },
            headers: headers

      expect(response).to have_http_status(:success)
      expect(usuario.reload.role).to eq("usuario")
    end
  end
end
