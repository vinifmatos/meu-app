class FaceCarta < ApplicationRecord
  belongs_to :carta

  enum :face, front: 1, back: 2

  def nome_exibicao
    printed_name || name
  end

  def tipo_exibicao
    printed_type_line || type_line
  end

  def texto_exibicao
    printed_text || oracle_text
  end
end
