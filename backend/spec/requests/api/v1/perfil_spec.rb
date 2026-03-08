require 'rails_helper'

RSpec.describe "Api::V1::Perfil", type: :request do
  let(:usuario) { create(:usuario) }
  let(:outro_usuario) { create(:usuario) }
  let(:headers) { auth_headers(usuario) }

  describe "Acesso Restrito (Segurança)" do
    it "retorna 401 ao tentar visualizar perfil sem autenticação" do
      get api_v1_perfil_path
      expect(response).to have_http_status(:unauthorized)
    end

    it "retorna 401 ao tentar atualizar perfil sem autenticação" do
      patch api_v1_perfil_path, params: { usuario: { nome: 'Hacker' } }
      expect(response).to have_http_status(:unauthorized)
    end

    it "não permite que um usuário altere dados de outro via perfil" do
      # O PerfilController usa current_user, então testamos se ele não aceita IDs externos
      patch api_v1_perfil_path,
            params: { usuario: { id: outro_usuario.id, nome: 'Nome Alterado' } },
            headers: headers

      outro_usuario.reload
      expect(outro_usuario.nome).not_to eq('Nome Alterado')
      expect(usuario.reload.nome).to eq('Nome Alterado')
    end

    it "não expõe campos sensíveis no JSON (password_digest, token)" do
      get api_v1_perfil_path, headers: headers
      json = JSON.parse(response.body)

      expect(json['data']['usuario']).not_to have_key('password_digest')
      expect(json['data']['usuario']).not_to have_key('confirmation_token')
    end
  end

  describe "GET /api/v1/perfil" do
    it "retorna as informações do usuário logado" do
      get api_v1_perfil_path, headers: headers
      expect(response).to have_http_status(:ok)

      data = JSON.parse(response.body)['data']
      expect(data['usuario']['username']).to eq(usuario.username)
      expect(data['usuario']['email']).to eq(usuario.email)
      expect(data['usuario']['nome']).to eq(usuario.nome)
    end
  end

  describe "PATCH /api/v1/perfil" do
    context "atualizando nome" do
      it "atualiza o nome com sucesso" do
        patch api_v1_perfil_path, params: { usuario: { nome: 'Novo Nome' } }, headers: headers
        expect(response).to have_http_status(:ok)
        usuario.reload
        expect(usuario.nome).to eq('Novo Nome')
      end
    end

    context "atualizando senha" do
      it "atualiza a senha com a senha atual correta" do
        patch api_v1_perfil_path,
              params: {
                usuario: {
                  current_password: 'Password123@',
                  password: 'NewPassword123@',
                  password_confirmation: 'NewPassword123@'
                }
              },
              headers: headers
        expect(response).to have_http_status(:ok)
        expect(usuario.reload.authenticate('NewPassword123@')).to be_truthy
      end

      it "falha ao atualizar a senha com a senha atual incorreta" do
        patch api_v1_perfil_path,
              params: {
                usuario: {
                  current_password: 'wrong_password',
                  password: 'NewPassword123@',
                  password_confirmation: 'NewPassword123@'
                }
              },
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "atualizando email" do
      it "altera o email e exige nova confirmação" do
        patch api_v1_perfil_path, params: { usuario: { email: 'new@example.com' } }, headers: headers
        expect(response).to have_http_status(:ok)

        usuario.reload
        expect(usuario.unconfirmed_email).to eq('new@example.com')
        expect(usuario.email).to_not eq('new@example.com')
      end
    end
  end
end
