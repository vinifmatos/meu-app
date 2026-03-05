class BanimentoIp < ApplicationRecord
  validates :ip, presence: true, uniqueness: true
end
