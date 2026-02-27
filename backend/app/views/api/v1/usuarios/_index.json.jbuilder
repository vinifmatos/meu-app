json.array! @usuarios do |usuario|
  json.extract! usuario, :id, :username, :name
end
