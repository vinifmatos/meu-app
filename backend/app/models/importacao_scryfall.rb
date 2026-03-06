class ImportacaoScryfall < ApplicationRecord
  enum :tipo, bulk_data: 0, simbolos: 1
  enum :status, pendente: 0, processando: 1, concluido: 2, falha: 3, cancelado: 4

  validates :tipo, :status, presence: true

  before_validation :set_default_status, on: :create

  def update_progresso!(processado)
    return if metadata["size"].to_i.zero?

    self.size_processado += processado
    percentual = (size_processado.to_f / metadata["size"].to_f * 100).round(2)
    update!(progresso: percentual, size_processado: size_processado)
  end

  def finalizar!
    update!(status: :concluido, finished_at: Time.current, progresso: 100)
  end

  def falhar!(erro)
    update!(status: :falha, finished_at: Time.current, mensagem_erro: erro)
  end

  private

  def set_default_status
    self.status ||= :pendente
  end
end
