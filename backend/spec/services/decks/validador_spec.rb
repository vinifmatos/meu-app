require 'rails_helper'

RSpec.describe Decks::Validador, type: :service do
  let(:usuario) { Usuario.find_by(username: 'admin') || create(:usuario) }
  
  describe '#validar!' do
    it 'valida que o deck não pode estar vazio' do
      deck_vazio = create(:deck, usuario: usuario)
      validador_vazio = described_class.new(deck_vazio)
      erros = validador_vazio.validar!
      expect(erros).to include(match(/O deck não pode estar vazio/))
    end

    context 'quando o deck é Pauper' do
      let(:deck) { create(:deck, formato: 'pauper', usuario: usuario) }
      let(:validador) { described_class.new(deck) }

      it 'valida que o deck deve ter pelo menos 60 cartas' do
        create(:deck_carta, deck: deck, quantidade: 59)
        erros = validador.validar!
        expect(erros).to include(match(/Mínimo de 60 cartas/))
      end

      it 'valida que o deck não pode ter mais que 4 cópias da mesma carta' do
        carta = create(:carta)
        create(:deck_carta, deck: deck, carta: carta, quantidade: 5)
        erros = validador.validar!
        expect(erros).to include(match(/Limite excedido para '.*': máximo de 4 cópia\(s\)/))
      end

      it 'permite qualquer quantidade de terrenos básicos' do
        # type_line deve conter Basic e Land em inglês conforme a implementação
        terreno = create(:carta, name: 'Island', type_line: 'Basic Land — Island')
        create(:deck_carta, deck: deck, carta: terreno, quantidade: 60)
        erros = validador.validar!
        expect(erros).not_to include(match(/Limite excedido para 'Island'/))
      end

      it 'valida que todas as cartas devem ser permitidas no formato' do
        # Criamos uma carta com legalidade explicitamente não permitida
        carta_ilegal = create(:carta, name: 'Carta Ilegal', legalities: { pauper: 'not_legal', commander: 'legal' })
        create(:deck_carta, deck: deck, carta: carta_ilegal, quantidade: 1)
        erros = validador.validar!
        expect(erros).to include(match(/não é permitida no formato Pauper/))
      end

      it 'valida que cartas banidas no Pauper não são permitidas' do
        carta_banida = create(:carta, name: 'Atog', legalities: { pauper: 'banned', commander: 'legal' })
        create(:deck_carta, deck: deck, carta: carta_banida, quantidade: 1)
        erros = validador.validar!
        expect(erros).to include(match(/não é permitida no formato Pauper/))
      end
    end

    context 'quando o deck é Commander' do
      let(:deck) { create(:deck, formato: 'commander', usuario: usuario) }
      let(:validador) { described_class.new(deck) }

      it 'valida que o deck deve ter exatamente 100 cartas' do
        create(:deck_carta, deck: deck, quantidade: 99)
        erros = validador.validar!
        expect(erros).to include(match(/deve ter exatamente 100 cartas/))
      end

      it 'valida que o deck deve ter pelo menos um comandante' do
        create(:deck_carta, deck: deck, quantidade: 100, eh_comandante: false)
        erros = validador.validar!
        expect(erros).to include(match(/deve ter pelo menos um comandante/))
      end

      it 'valida que o deck não pode ter mais que 1 cópia da mesma carta' do
        carta = create(:carta)
        create(:deck_carta, deck: deck, carta: carta, quantidade: 2)
        erros = validador.validar!
        expect(erros).to include(match(/Limite excedido para '.*': máximo de 1 cópia\(s\)/))
      end

      it 'valida que terrenos não básicos também são limitados a 1 cópia' do
        terreno = create(:carta, name: 'Command Tower', type_line: 'Land')
        create(:deck_carta, deck: deck, carta: terreno, quantidade: 2)
        erros = validador.validar!
        expect(erros).to include(match(/Limite excedido para 'Command Tower'/))
      end

      it 'valida a identidade de cor baseada no comandante' do
        comandante = create(:carta, color_identity: ['U'])
        carta_vermelha = create(:carta, color_identity: ['R'])
        
        create(:deck_carta, deck: deck, carta: comandante, quantidade: 1, eh_comandante: true)
        create(:deck_carta, deck: deck, carta: carta_vermelha, quantidade: 1)
        
        erros = validador.validar!
        expect(erros).to include(match(/fora da identidade do comandante/))
      end

      it 'valida que cartas banidas no Commander não são permitidas' do
        carta_banida = create(:carta, name: 'Black Lotus', legalities: { commander: 'banned', pauper: 'not_legal' })
        create(:deck_carta, deck: deck, carta: carta_banida, quantidade: 1)
        erros = validador.validar!
        expect(erros).to include(match(/não é permitida no formato Commander/))
      end
    end
  end
end
