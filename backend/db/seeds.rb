# Usuário padrão para desenvolvimento e testes
admin = Usuario.find_or_create_by!(username: 'admin') do |u|
  u.nome = 'Administrador'
  u.email = 'admin@example.com'
  u.password = 'Password123@'
  u.password_confirmation = 'Password123@'
  u.role = :admin
  u.confirmed_at = Time.current
end

puts "Seed finalizado: Usuário 'admin' criado/verificado."

# Criar um deck padrão para o admin se não existir
Deck.find_or_create_by!(nome: 'Deck Inicial Admin', usuario: admin) do |d|
  d.formato = :pauper
end

puts "Seed finalizado: Deck 'Deck Inicial Admin' criado/verificado."
