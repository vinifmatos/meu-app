class Deck < ApplicationRecord
  belongs_to :usuario
  has_many :deck_cartas, dependent: :destroy
  has_many :cartas, through: :deck_cartas

  enum :formato, pauper: 1, commander: 2

  validates :nome, presence: true
  validates :formato, presence: true

  # Atalhos para categorias comuns no MTG
  def comandantes
    cartas.where(deck_cartas: { eh_comandante: true })
  end

  def terrenos
    cartas.where("cartas.type_line ILIKE '%Land%'")
  end

  def criaturas
    cartas.where("cartas.type_line ILIKE '%Creature%'").where.not("cartas.type_line ILIKE '%Land%'")
  end

  # ... outras categorias podem ser scopes ou métodos
end
