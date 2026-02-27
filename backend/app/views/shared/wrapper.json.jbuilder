json.message @response_message
json.errors @response_errors

if @response_data
  json.data do
    json.partial! @response_data[:template], locals: @response_data[:locals] || {}
  end
else
  json.data nil
end
