class ImportacaoScryfall < ApplicationRecord
  enum :tipo, bulk_data: 0, simbolos: 1
  enum :status, pendente: 0, processando: 1, concluido: 2, falha: 3, cancelado: 4

  validates :tipo, :status, presence: true

  before_validation :set_default_status, on: :create

  def update_progresso!(bytes_processados)
    return if bytes_processados <= 0 || file_size.to_i.zero?

    # Atualização atômica no banco de dados: evita reloads e race conditions.
    # O PostgreSQL faz o incremento e o cálculo do percentual em uma única operação.
    self.class.where(id: id).update_all([
      "readed_size = readed_size + ?, " \
      "progresso = LEAST(100.0, ROUND(((readed_size + ?)::float / file_size * 100)::numeric, 2))",
      bytes_processados, bytes_processados
    ])
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
