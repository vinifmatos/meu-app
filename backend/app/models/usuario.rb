class Usuario < ApplicationRecord
  has_secure_password

  has_many :decks, dependent: :destroy
  has_many :refresh_tokens, dependent: :destroy

  enum :role, admin: 0, usuario: 1

  validates :username, presence: true, uniqueness: true, length: { minimum: 3 }, format: { with: /\A[a-zA-Z0-9_]+\z/, message: "deve conter apenas letras, números e _" }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :nome, presence: true
  validates :password, length: { minimum: 6 },
                       format: { with: /\A[a-zA-Z0-9@$*&#]+\z/, message: "pode conter apenas letras, números e caracteres especiais @$*&#" },
                       if: -> { password.present? }
  validates :role, presence: true

  before_create :generate_confirmation_token

  def confirmed?
    confirmed_at.present?
  end

  def confirm!
    if unconfirmed_email.present?
      self.email = unconfirmed_email
      self.unconfirmed_email = nil
    end
    self.confirmed_at = Time.current
    self.confirmation_token = nil
    save(validate: false)
  end

  def generate_confirmation_token
    self.confirmation_token = SecureRandom.urlsafe_base64
  end
end
