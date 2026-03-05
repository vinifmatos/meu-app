ActiveSupport::Inflector.inflections(:en) do |inflect|
  inflections = {
    "usuario" => "usuarios",
    "face_carta" => "faces_cartas",
    "carta" => "cartas",
    "simbolo" => "simbolos",
    "deck" => "decks",
    "deck_carta" => "deck_cartas"
  }

  inflections.each do |singular, plural|
    inflect.plural Regexp.new("^#{singular}$"), plural
    inflect.singular Regexp.new("^#{plural}$"), singular
  end
end
