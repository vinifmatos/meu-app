# Usuário padrão para desenvolvimento e testes
Usuario.find_or_create_by!(username: 'admin') do |u|
  u.nome = 'Administrador'
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.role = :admin
end

puts "Seed finalizado: Usuário 'admin' criado/verificado."
