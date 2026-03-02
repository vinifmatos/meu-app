json.array! @usuarios do |usuario|
  json.extract! usuario, :id, :username, :nome, :role, :created_at, :updated_at
end
