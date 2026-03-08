FactoryBot.define do
  factory :importacao_scryfall do
    tipo { :bulk_data }
    status { :pendente }
    progresso { 0 }
    size_processado { 0 }
    metadata { {} }

    trait :processando do
      status { :processando }
      started_at { Time.current }
    end

    trait :concluido do
      status { :concluido }
      progresso { 100 }
      started_at { 1.hour.ago }
      finished_at { Time.current }
    end

    trait :falha do
      status { :falha }
      mensagem_erro { "Erro de conexão" }
    end
  end
end
