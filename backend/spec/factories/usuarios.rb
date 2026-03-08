FactoryBot.define do
  factory :usuario do
    username { Faker::Internet.unique.username(specifier: 3..20, separators: %w[_]) }
    nome { Faker::Name.name }
    email { Faker::Internet.unique.email }
    password { "Password123@" }
    role { :usuario }
    confirmed_at { Time.current }

    trait :admin do
      role { :admin }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end
  end
end
