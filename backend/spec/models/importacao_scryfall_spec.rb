require 'rails_helper'

RSpec.describe ImportacaoScryfall, type: :model do
  describe 'validações' do
    it { should validate_presence_of(:tipo) }
    it { should define_enum_for(:tipo).with_values(bulk_data: 0, simbolos: 1) }
    it { should define_enum_for(:status).with_values(pendente: 0, processando: 1, concluido: 2, falha: 3, cancelado: 4) }
  end

  describe 'callbacks' do
    it 'define o status inicial como pendente' do
      importacao = ImportacaoScryfall.new(tipo: :bulk_data)
      importacao.valid?
      expect(importacao.status).to eq('pendente')
    end
  end

  describe 'métodos auxiliares' do
    let(:importacao) { create(:importacao_scryfall, :processando, file_size: 100, readed_size: 0) }

    it 'calcula o progresso corretamente' do
      importacao.update_progresso!(50)
      expect(importacao.reload.progresso).to eq(50)
    end

    it 'finaliza a importação com sucesso' do
      importacao.finalizar!
      expect(importacao.reload.status).to eq('concluido')
      expect(importacao.finished_at).to be_present
      expect(importacao.progresso).to eq(100)
    end

    it 'marca como falha' do
      importacao.falhar!("Erro fatal")
      expect(importacao.status).to eq('falha')
      expect(importacao.mensagem_erro).to eq("Erro fatal")
      expect(importacao.finished_at).to be_present
    end
  end
end
