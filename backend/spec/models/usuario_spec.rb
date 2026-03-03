require 'rails_helper'

RSpec.describe Usuario, type: :model do
  subject { build(:usuario) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:username) }
    it { is_expected.to validate_uniqueness_of(:username) }
    it { is_expected.to validate_length_of(:username).is_at_least(3) }
    it { is_expected.to allow_value('test_user').for(:username) }
    it { is_expected.not_to allow_value('test user').for(:username) }
    it { is_expected.to validate_length_of(:password).is_at_least(6) }
    it { is_expected.to validate_presence_of(:role) }
  end

  describe 'factory' do
    it 'is valid' do
      expect(build(:usuario)).to be_valid
    end

    it 'is an admin' do
      admin = build(:usuario, :admin)
      expect(admin.role).to eq('admin')
    end
  end
end
