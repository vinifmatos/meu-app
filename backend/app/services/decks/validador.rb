module Decks
  class Validador
    def initialize(deck)
      @deck = deck
      @erros = []
    end

    def validar!
      @erros = []
      
      return @erros unless @deck.deck_cartas.any?

      case @deck.formato
      when 'pauper'
        validar_pauper
      when 'commander'
        validar_commander
      end

      @erros
    end

    private

    def validar_pauper
      total = @deck.deck_cartas.sum(:quantidade)
      @erros << "Mínimo de 60 cartas para o formato Pauper (atual: #{total})" if total < 60

      validar_limite_copias(4)
      validar_raridade_comum
    end

    def validar_commander
      total = @deck.deck_cartas.sum(:quantidade)
      @erros << "O deck de Commander deve ter exatamente 100 cartas (atual: #{total})" if total != 100

      comandantes = @deck.comandantes
      @erros << "O deck deve ter pelo menos um comandante" if comandantes.empty?

      validar_limite_copias(1)
      validar_identidade_cor(comandantes) if comandantes.any?
    end

    def validar_limite_copias(limite)
      @deck.deck_cartas.joins(:carta).group('cartas.oracle_id', 'cartas.name').sum(:quantidade).each do |(oracle_id, name), qtd|
        next if terreno_basico?(name)
        @erros << "Limite excedido para '#{name}': máximo de #{limite} cópia(s)" if qtd > limite
      end
    end

    def validar_raridade_comum
      @deck.cartas.distinct(:oracle_id).each do |carta|
        # Verifica se existe ALGUMA impressão dessa carta como comum
        foi_comum = Carta.where(oracle_id: carta.oracle_id, rarity: 'common').exists?
        @erros << "A carta '#{carta.name}' não é legal no Pauper (nunca foi impressa como comum)" unless foi_comum
      end
    end

    def validar_identidade_cor(comandantes)
      identidade_deck = comandantes.map(&:color_identity).flatten.uniq
      
      @deck.cartas.each do |carta|
        fora_da_identidade = (carta.color_identity - identidade_deck).any?
        @erros << "A carta '#{carta.name}' possui cores fora da identidade do comandante" if fora_da_identidade
      end
    end

    def terreno_basico?(nome)
      ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes',
       'Planície', 'Ilha', 'Pântano', 'Montanha', 'Floresta'].include?(nome)
    end
  end
end
