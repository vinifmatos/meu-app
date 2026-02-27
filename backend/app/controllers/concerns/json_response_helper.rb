module JsonResponseHelper
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid
    rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
    rescue_from StandardError, with: :handle_standard_error
  end

  def render_json_success(template: "#{controller_path}/#{action_name}", locals: {}, message: nil, status: :ok, data: nil)
    if status == :no_content
      head :no_content
    else
      template = "#{controller_path}/#{template}" if template.is_a?(Symbol)
      @response_message = message
      @response_errors = nil
      @response_data = { template: template, locals: locals, data: data }
      render template: "shared/wrapper", status: status
    end
  end

  def render_json_error(message: "Não foi possível processar a requisição", errors: nil, status: :unprocessable_entity)
    @response_message = message
    @response_errors = errors
    @response_data = nil
    render template: "shared/wrapper", status: status
  end

  private

  def handle_record_invalid(exception)
    record = exception.record
    render_json_error(
      message: "Falha na validação",
      errors: record.errors.full_messages,
      status: :unprocessable_entity
    )
  end

  def handle_record_not_found(exception)
    render_json_error(
      message: "Registro não encontrado",
      errors: [ exception.message ],
      status: :not_found
    )
  end

  def handle_standard_error(exception)
    Rails.logger.error(exception.message)
    Rails.logger.error(exception.backtrace.join("\n"))

    raise exception if Rails.env.development? || Rails.env.test?

    render_json_error(
      message: "Ocorreu um erro inesperado",
      status: :internal_server_error
    )
  end
end
