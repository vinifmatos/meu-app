json.carta do
  json.partial! "api/v1/cartas/show", carta: carta
end

json.versoes(versoes) do |versao|
  json.partial! "api/v1/cartas/show", carta: versao
end

# Lista de idiomas disponíveis para esta carta (oracle_id)
json.idiomas_disponiveis Carta.where(oracle_id: carta.oracle_id).distinct.pluck(:lang)
