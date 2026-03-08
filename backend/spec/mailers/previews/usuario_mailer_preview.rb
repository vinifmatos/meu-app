# Preview all emails at http://localhost:3000/rails/mailers/usuario_mailer_mailer
class UsuarioMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/usuario_mailer_mailer/confirmacao_email
  def confirmacao_email
    UsuarioMailer.confirmacao_email
  end
end
