require 'rails_helper'

RSpec.describe BanimentoIp, type: :model do
  describe 'validations' do
    subject { build(:banimento_ip) }
    it { should validate_presence_of(:ip) }
    it { should validate_uniqueness_of(:ip).case_insensitive }
  end

  it 'has a valid factory' do
    expect(build(:banimento_ip)).to be_valid
  end
end
