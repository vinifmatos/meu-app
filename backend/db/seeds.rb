# Usuário padrão para desenvolvimento e testes
admin = Usuario.find_or_create_by!(username: 'admin') do |u|
  u.nome = 'Administrador'
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.role = :admin
end

puts "Seed finalizado: Usuário 'admin' criado/verificado."

# Criar um deck padrão para o admin se não existir
Deck.find_or_create_by!(nome: 'Deck Inicial Admin', usuario: admin) do |d|
  d.formato = :pauper
end

puts "Seed finalizado: Deck 'Deck Inicial Admin' criado/verificado."
