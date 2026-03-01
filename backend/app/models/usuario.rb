class Usuario < ApplicationRecord
  has_secure_password

  enum :role, admin: 0, usuario: 1

  validates :username, presence: true, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  validates :role, presence: true
end
