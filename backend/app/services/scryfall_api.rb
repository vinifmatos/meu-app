class ScryfallApi
  BASE_URL = "https://api.scryfall.com"

  def initialize
    @client = HTTP.timeout(connect: 5, read: 10).use(:auto_inflate).headers("Accept" => "application/json")
  end

  def symbols
    response = @client.get("#{BASE_URL}/symbology")
    if response.status.success?
      JSON.parse(response.body.to_s)["data"]
    else
      []
    end
  rescue StandardError => e
    raise Error, "Failed to fetch symbols from Scryfall API: #{e.message}"
  end

  def all_cards
    response = @client.get("#{BASE_URL}/bulk-data/all_cards")
    if response.status.success?
      JSON.parse(response.body.to_s)
    else
      nil
    end
  rescue StandardError => e
    raise Error, "Failed to fetch cards from Scryfall API: #{e.message}"
  end

  def self.import_data
    api = new
    symbols_data = api.symbols
    if symbols_data
      Symbol.import_from_scryfall(symbols_data)
    else
      raise LoadFailure, "Failed to fetch symbols from Scryfall API"
    end

    cards_data = api.all_cards
    if cards_data
      Card.import_from_scryfall(cards_data)
    else
      raise LoadFailure, "Failed to fetch cards from Scryfall API"
    end
  end

  class Error < StandardError; end

  class LoadFailure < Error; end
end
