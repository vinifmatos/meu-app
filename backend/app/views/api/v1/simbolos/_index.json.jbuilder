json.simbolos(simbolos) do |simbolo|
  json.call(
    simbolo,
    :symbol,
    :english,
    :represents_mana,
    :mana_value,
    :appears_in_mana_costs,
    :colors,
    :hybrid,
    :phyrexian,
    :svg_uri
  )
end
