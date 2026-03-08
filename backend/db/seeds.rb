# Usuário padrão para desenvolvimento e testes
admin_password = ENV.fetch('ADMIN_PASSWORD', 'Password123@')
admin = Usuario.find_or_create_by!(username: 'admin') do |u|
  u.nome = 'Administrador'
  u.email = 'admin@example.com'
  u.password = admin_password
  u.password_confirmation = admin_password
  u.role = :admin
  u.confirmed_at = Time.current
end

puts "Seed finalizado: Usuário 'admin' criado/verificado."

# Criar um deck padrão para o admin se não existir
Deck.find_or_create_by!(nome: 'Deck Inicial Admin', usuario: admin) do |d|
  d.formato = :pauper
end

puts "Seed finalizado: Deck 'Deck Inicial Admin' criado/verificado."
