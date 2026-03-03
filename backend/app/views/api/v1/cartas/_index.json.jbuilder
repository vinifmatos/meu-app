json.cartas(cartas) do |carta|
  json.partial! "api/v1/cartas/show", carta: carta
end

json.pagination do
  json.current_page cartas.current_page
  json.total_pages cartas.total_pages
  json.total_count cartas.total_count
end
