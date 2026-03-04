json.decks(decks) do |deck|
  json.partial! "api/v1/decks/show", deck: deck
end
