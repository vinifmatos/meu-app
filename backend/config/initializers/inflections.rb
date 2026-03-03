ActiveSupport::Inflector.inflections(:en) do |inflect|
  inflect.clear

  inflections = {
    "usuario" => "usuarios",
    "face_carta" => "faces_cartas",
    "carta" => "cartas",
    "simbolo" => "simbolos"
  }

  inflections.each do |singular, plural|
    inflect.plural Regexp.new("^#{singular}$"), plural
    inflect.singular Regexp.new("^#{plural}$"), singular
  end
end
