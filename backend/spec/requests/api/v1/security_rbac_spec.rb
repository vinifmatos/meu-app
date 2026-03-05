require 'rails_helper'

RSpec.describe "Segurança & RBAC (Role-Based Access Control)", type: :request do
  let(:admin) { Usuario.find_by(username: 'admin') || create(:usuario, :admin, username: 'admin') }
  let(:usuario) { create(:usuario) }
  let(:outro_usuario) { create(:usuario) }
  let(:headers_usuario) { auth_headers(usuario).merge("Accept" => "application/json", "Content-Type" => "application/json") }
  let(:headers_admin) { auth_headers(admin).merge("Accept" => "application/json", "Content-Type" => "application/json") }

  describe "Acesso a Usuários (Somente Admin)" do
    it "proíbe que um usuário comum liste todos os usuários" do
      get api_v1_usuarios_path, headers: headers_usuario
      expect(response).to have_http_status(:forbidden)
    end

    it "proíbe que um usuário comum crie outro usuário" do
      post api_v1_usuarios_path, params: { data: { usuario: attributes_for(:usuario) } }.to_json, headers: headers_usuario
      expect(response).to have_http_status(:forbidden)
    end

    it "proíbe que um usuário comum atualize outro usuário" do
      patch api_v1_usuario_path(outro_usuario), params: { data: { usuario: { nome: 'Hacker' } } }.to_json, headers: headers_usuario
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "Integridade de Decks (Propriedade)" do
    let!(:deck_privado) { create(:deck, usuario: outro_usuario, nome: "Deck Secreto") }

    it "proíbe que um usuário altere o deck de outro" do
      patch api_v1_deck_path(deck_privado), params: { data: { deck: { nome: "Hackeado" } } }.to_json, headers: headers_usuario
      
      expect(response).to have_http_status(:forbidden)
      expect(deck_privado.reload.nome).to eq("Deck Secreto")
    end

    it "proíbe que um usuário exclua o deck de outro" do
      expect {
        delete api_v1_deck_path(deck_privado), headers: headers_usuario
      }.not_to change(Deck, :count)
      
      expect(response).to have_http_status(:forbidden)
    end

    it "proíbe que um usuário adicione cartas ao deck de outro" do
      carta = create(:carta)
      post api_v1_deck_cartas_path(deck_privado), params: { data: { deck_carta: { carta_id: carta.id, quantidade: 1 } } }.to_json, headers: headers_usuario
      
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "Vazamento de Dados (Data Leakage)" do
    it "não retorna o password_digest na listagem de usuários para o admin" do
      get api_v1_usuarios_path, headers: headers_admin
      
      json = JSON.parse(response.body)
      usuarios = json['data']['usuarios']
      expect(usuarios.any?).to be_truthy
      expect(usuarios.first).not_to have_key('password_digest')
      expect(usuarios.first).not_to have_key('password')
    end
  end
end
