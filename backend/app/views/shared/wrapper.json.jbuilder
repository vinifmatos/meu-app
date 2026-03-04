json.message @response_message if @response_message
json.validation_errors @response_validation_errors if @response_validation_errors

if @response_data
  json.data do
    if @response_data[:template]
      # Tentamos renderizar como template completo primeiro para respeitar o encapsulamento
      begin
        json.merge! JSON.parse(ApplicationController.render(template: @response_data[:template], locals: @response_data[:locals], formats: [:json]))
      rescue ActionView::MissingTemplate
        # Se falhar (ex: index), tentamos como partial
        json.partial! @response_data[:template], @response_data[:locals]
      end
    elsif @response_data[:data]
      json.merge! @response_data[:data]
    else
      json.data nil
    end
  end
else
  json.data nil
end
