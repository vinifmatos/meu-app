json.usuarios(usuarios) do |usuario|
  json.partial! "api/v1/usuarios/show", usuario: usuario
end

json.pagination do
  json.current_page usuarios.current_page
  json.total_pages usuarios.total_pages
  json.total_count usuarios.total_count
end
