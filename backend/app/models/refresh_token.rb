class RefreshToken < ApplicationRecord
  belongs_to :usuario

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  before_validation :generate_token, on: :create

  def expired?
    Time.current >= expires_at
  end

  def revoked?
    revoked_at.present?
  end

  def valid_token?
    !expired? && !revoked?
  end

  def revoke!
    update(revoked_at: Time.current)
  end

  private

  def generate_token
    self.token ||= SecureRandom.hex(32)
    self.expires_at ||= 30.days.from_now
  end
end
