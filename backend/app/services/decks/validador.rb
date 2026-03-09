module Decks
  class Validador
    def initialize(deck)
      @deck = deck
      @erros = []
    end

    def validar!
      @erros = []

      if @deck.deck_cartas.empty?
        @erros << "O deck não pode estar vazio"
        return @erros
      end

      case @deck.formato
      when "pauper"
        validar_pauper
      when "commander"
        validar_commander
      end

      validar_legalidade_formato

      @erros
    end

    private

    def validar_pauper
      total = @deck.deck_cartas.sum(:quantidade)
      @erros << "Mínimo de 60 cartas para o formato Pauper (atual: #{total})" if total < 60

      validar_limite_copias(4)
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
      # Agrupamos por oracle_id para contar cópias da mesma carta independente da versão/set
      @deck.deck_cartas.joins(:carta).group("cartas.oracle_id", "cartas.name", "cartas.printed_name", "cartas.type_line").sum(:quantidade).each do |(oracle_id, name, printed_name, type_line), qtd|
        next if terreno_basico?(type_line)
        nome_exibicao = printed_name || name
        @erros << "Limite excedido para '#{nome_exibicao}': máximo de #{limite} cópia(s)" if qtd > limite
      end
    end

    def validar_identidade_cor(comandantes)
      identidade_deck = comandantes.map(&:color_identity).flatten.uniq.compact

      @deck.cartas.each do |carta|
        next if carta.color_identity.nil?
        fora_da_identidade = (carta.color_identity - identidade_deck).any?
        @erros << "A carta '#{carta.nome_exibicao}' possui cores fora da identidade do comandante" if fora_da_identidade
      end
    end

    def validar_legalidade_formato
      formato = @deck.formato
      @deck.cartas.distinct.each do |carta|
        status = carta.legalities&.[](formato)
        if status != "legal" && status != "restricted"
          @erros << "A carta '#{carta.nome_exibicao}' não é permitida no formato #{formato.capitalize} (Status: #{status&.humanize || 'Desconhecido'})"
        end
      end
    end

    def terreno_basico?(type_line)
      type_line&.include?("Basic") && type_line&.include?("Land")
    end
  end
end
