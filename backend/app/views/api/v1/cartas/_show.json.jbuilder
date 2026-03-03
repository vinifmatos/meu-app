json.id carta.id
json.scryfall_id carta.scryfall_id
json.oracle_id carta.oracle_id
json.name carta.nome_exibicao
json.type_line carta.tipo_exibicao
json.call(
  carta,
  :mana_cost,
  :oracle_text,
  :power,
  :toughness,
  :colors,
  :color_identity,
  :color_indicator,
  :set,
  :collector_number,
  :lang,
  :image_uris
)

json.faces(carta.faces) do |face|
  json.call(
    face,
    :id,
    :face,
    :name,
    :type_line,
    :mana_cost,
    :oracle_text,
    :power,
    :toughness,
    :colors,
    :image_uris,
    :illustration_id
  )
end
