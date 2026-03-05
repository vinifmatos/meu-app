FactoryBot.define do
  factory :banimento_ip do
    sequence(:ip) { |n| "127.0.0.#{n}" }
    motivo { "Abuso de throttle ou acesso a arquivos sensíveis" }
  end
end
