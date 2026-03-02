ActiveSupport::Inflector.inflections(:'pt-BR') do |inflect|
  inflections = {
    "usuario" => "usuarios",
    "dados_carta" => "dados_cartas",
    "face_carta" => "face_cartas",
    "traducao_carta" => "traducoes_cartas",
    "carta" => "cartas",
    "simbolo" => "simbolos"
  }

  inflections.each do |singular, plural|
    inflect.plural singular, plural
    inflect.singular plural, singular
  end
end
