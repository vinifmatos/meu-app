class Usuario < ApplicationRecord
  has_secure_password

  has_many :decks, dependent: :destroy

  enum :role, admin: 0, usuario: 1

  validates :username, presence: true, uniqueness: true, length: { minimum: 3 }, format: { with: /\A[a-zA-Z0-9_]+\z/, message: "deve conter apenas letras, números e _" }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  validates :role, presence: true
end
