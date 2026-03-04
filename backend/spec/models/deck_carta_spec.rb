require 'rails_helper'

RSpec.describe DeckCarta, type: :model do
  describe 'associações' do
    it { should belong_to(:deck) }
    it { should belong_to(:carta) }
  end
end
