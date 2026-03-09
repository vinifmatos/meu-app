FactoryBot.define do
  factory :carta do
    scryfall_id { SecureRandom.uuid }
    oracle_id { SecureRandom.uuid }
    name { Faker::Name.unique.name }
    type_line { "Creature — Human Wizard" }
    mana_cost { "{1}{U}" }
    oracle_text { "Draw a card." }
    power { "1" }
    toughness { "1" }
    colors { [ "U" ] }
    color_identity { [ "U" ] }
    set { "m21" }
    collector_number { "1" }
    lang { "en" }
    legalities do
      {
        pauper: "legal",
        commander: "legal",
        standard: "legal",
        modern: "legal",
        legacy: "legal",
        vintage: "legal"
      }
    end
    image_uris do
      {
        small: "http://example.com/small.jpg",
        normal: "http://example.com/normal.jpg",
        large: "http://example.com/large.jpg"
      }
    end

    trait :with_faces do
      after(:create) do |carta|
        create(:face_carta, carta: carta, face: :front)
        create(:face_carta, carta: carta, face: :back)
      end
    end
  end

  factory :face_carta do
    carta
    face { :front }
    name { Faker::Name.name }
    type_line { "Legendary Creature" }
    illustration_id { SecureRandom.uuid }
    image_uris do
      {
        small: "http://example.com/face_small.jpg",
        normal: "http://example.com/face_normal.jpg"
      }
    end
  end
end
