FactoryBot.define do
  factory :deck_carta do
    deck
    carta
    quantidade { 1 }
    eh_comandante { false }
  end
end
