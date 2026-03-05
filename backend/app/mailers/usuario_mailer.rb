class UsuarioMailer < ApplicationMailer
  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.usuario_mailer.confirmacao_email.subject
  #
  def confirmacao_email(usuario)
    @usuario = usuario
    @url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:4200')}/confirmar-conta?token=#{@usuario.confirmation_token}"
    mail(to: @usuario.email, subject: "Confirmação de Conta")
  end
end
