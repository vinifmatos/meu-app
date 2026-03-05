require "rails_helper"

RSpec.describe UsuarioMailer, type: :mailer do
  describe "confirmacao_email" do
    let(:usuario) { create(:usuario, email: 'user@example.com') }
    let(:mail) { UsuarioMailer.confirmacao_email(usuario) }

    it "renders the headers" do
      expect(mail.subject).to eq("Confirmação de Conta")
      expect(mail.to).to eq(["user@example.com"])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Ativar minha conta")
      # Removemos quebras de linha de quoted-printable e buscamos o token
      body_limpo = mail.body.encoded.gsub("=\r\n", "").gsub("=3D", "=")
      expect(body_limpo).to include("token=#{usuario.confirmation_token}")
    end
  end
end
