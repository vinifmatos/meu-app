json.id carta.id
json.scryfall_id carta.scryfall_id
json.oracle_id carta.oracle_id
json.name carta.nome_exibicao
json.type_line carta.tipo_exibicao
json.oracle_text carta.texto_exibicao
json.call(
  carta,
  :mana_cost,
  :power,
  :toughness,
  :colors,
  :color_identity,
  :color_indicator,
  :set,
  :collector_number,
  :lang,
  :released_at,
  :rarity,
  :image_uris
)

json.faces(carta.faces) do |face|
  json.id face.id
  json.face face.face
  json.name face.nome_exibicao
  json.type_line face.tipo_exibicao
  json.oracle_text face.texto_exibicao
  json.call(
    face,
    :mana_cost,
    :power,
    :toughness,
    :colors,
    :image_uris,
    :illustration_id
  )
end
