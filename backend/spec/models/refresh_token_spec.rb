require 'rails_helper'

RSpec.describe RefreshToken, type: :model do
  describe 'associações' do
    it { should belong_to(:usuario) }
  end

  describe 'validações' do
    subject { build(:refresh_token) }
    it { should validate_uniqueness_of(:token) }
  end

  describe 'callbacks' do
    it 'gera um token e expiração antes da validação na criação' do
      token = RefreshToken.new(usuario: create(:usuario))
      token.validate
      expect(token.token).to be_present
      expect(token.expires_at).to be_present
    end
  end

  describe '#expired?' do
    it 'retorna true se expirou' do
      token = build(:refresh_token, :expired)
      expect(token.expired?).to be_truthy
    end

    it 'retorna false se não expirou' do
      token = build(:refresh_token)
      expect(token.expired?).to be_falsy
    end
  end

  describe '#revoked?' do
    it 'retorna true se foi revogado' do
      token = build(:refresh_token, :revoked)
      expect(token.revoked?).to be_truthy
    end

    it 'retorna false se não foi revogado' do
      token = build(:refresh_token)
      expect(token.revoked?).to be_falsy
    end
  end

  describe '#valid_token?' do
    it 'retorna true se não expirou nem foi revogado' do
      token = build(:refresh_token)
      expect(token.valid_token?).to be_truthy
    end

    it 'retorna false se expirou' do
      token = build(:refresh_token, :expired)
      expect(token.valid_token?).to be_falsy
    end

    it 'retorna false se foi revogado' do
      token = build(:refresh_token, :revoked)
      expect(token.valid_token?).to be_falsy
    end
  end

  describe '#revoke!' do
    it 'define revoked_at com o tempo atual' do
      token = create(:refresh_token)
      expect { token.revoke! }.to change { token.revoked_at }.from(nil)
    end
  end
end
