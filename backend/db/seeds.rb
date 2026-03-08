# Usuário padrão da aplicação

admin_password = ENV.fetch('ADMIN_PASSWORD', 'Password123@')
Usuario.find_or_create_by!(username: 'admin') do |u|
  u.nome = 'Administrador'
  u.email = 'admin@example.com'
  u.password = admin_password
  u.password_confirmation = admin_password
  u.role = :admin
  u.confirmed_at = Time.current
end

puts "Seed finalizado: Usuário 'admin' criado/verificado."
