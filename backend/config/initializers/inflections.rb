ActiveSupport::Inflector.inflections(:'pt-BR') do |inflect|
  inflections = {
    "usuario" => "usuarios"
  }

  inflections.each do |singular, plural|
    inflect.plural singular, plural
    inflect.singular plural, singular
  end
end
