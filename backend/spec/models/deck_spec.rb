require 'rails_helper'

RSpec.describe Deck, type: :model do
  describe 'associações' do
    it { should belong_to(:usuario) }
    it { should have_many(:deck_cartas).dependent(:destroy) }
    it { should have_many(:cartas).through(:deck_cartas) }
  end

  describe 'validações' do
    it { should validate_presence_of(:nome) }
    it { should validate_presence_of(:formato) }
    it { should define_enum_for(:formato).with_values(pauper: 1, commander: 2) }
  end

  describe 'métodos de categoria' do
    let(:deck) { create(:deck) }
    let(:carta_criatura) { create(:carta, type_line: 'Creature — Human') }
    let(:carta_terreno) { create(:carta, type_line: 'Basic Land — Island') }

    before do
      deck.deck_cartas.create!(carta: carta_criatura, quantidade: 1, eh_comandante: true)
      deck.deck_cartas.create!(carta: carta_terreno, quantidade: 1, eh_comandante: false)
    end

    it '#comandantes retorna apenas cartas marcadas como comandante' do
      expect(deck.comandantes).to include(carta_criatura)
      expect(deck.comandantes).not_to include(carta_terreno)
    end

    it '#terrenos retorna apenas cartas do tipo Land' do
      expect(deck.terrenos).to include(carta_terreno)
      expect(deck.terrenos).not_to include(carta_criatura)
    end

    it '#criaturas retorna apenas cartas do tipo Creature (e que não são Land)' do
      expect(deck.criaturas).to include(carta_criatura)
      expect(deck.criaturas).not_to include(carta_terreno)
    end
  end
end
