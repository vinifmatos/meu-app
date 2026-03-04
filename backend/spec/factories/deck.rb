FactoryBot.define do
  factory :deck do
    usuario
    nome { "Meu Deck de Teste" }
    formato { :pauper }
  end
end
