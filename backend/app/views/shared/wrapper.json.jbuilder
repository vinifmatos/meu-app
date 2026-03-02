json.message @response_message if @response_message
json.validation_errors @response_validation_errors if @response_validation_errors

if @response_data
  json.data do
    if @response_data[:template]
      json.partial! @response_data[:template], @response_data[:locals]
    elsif @response_data[:data]
      json.merge! @response_data[:data]
    else
      json.data nil
    end
  end
else
  json.data nil
end
