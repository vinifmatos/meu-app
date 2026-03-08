class ImportacaoScryfall < ApplicationRecord
  enum :tipo, bulk_data: 0, simbolos: 1
  enum :status, pendente: 0, processando: 1, concluido: 2, falha: 3, cancelado: 4

  validates :tipo, :status, presence: true

  before_validation :set_default_status, on: :create

  def update_progresso!(processado)
    return if file_size.to_i.zero?

    self.readed_size += processado
    percentual = (readed_size.to_f / file_size * 100).round(2)
    percentual = 100.0 if percentual > 100.0

    # Throttle: Atualiza apenas se mudar mais de 0.1% ou se chegar no fim
    return if (percentual - progresso).abs < 0.1 && percentual < 100

    # Usar update_columns para evitar disparar callbacks e validações
    update_columns(progresso: percentual, readed_size: readed_size)
  end

  def finalizar!
    update!(status: :concluido, finished_at: Time.current, progresso: 100)
  end

  def falhar!(erro)
    update!(status: :falha, finished_at: Time.current, mensagem_erro: erro)
  end

  def cancelado?
    status == "cancelado"
  end

  private

  def set_default_status
    self.status ||= :pendente
  end
end
