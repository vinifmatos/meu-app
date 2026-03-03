FactoryBot.define do
  factory :usuario do
    username { Faker::Internet.unique.username(specifier: 3..20, separators: %w(_)) }
    nome { Faker::Name.name }
    password { "password" }
    role { :usuario }

    trait :admin do
      role { :admin }
    end
  end
end
