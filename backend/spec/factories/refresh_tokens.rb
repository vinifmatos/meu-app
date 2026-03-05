FactoryBot.define do
  factory :refresh_token do
    usuario { nil }
    token { "MyString" }
    expires_at { "2026-03-04 23:53:56" }
    revoked_at { "2026-03-04 23:53:56" }
  end
end
