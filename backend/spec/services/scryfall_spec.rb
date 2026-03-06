require "rails_helper"

RSpec.describe Scryfall::ParserCartasJson do
  let(:parser) { Scryfall::ParserCartasJson.new }

  describe "#<<" do
    it "acumula cartas no lote e as importa quando o tamanho do lote é atingido" do
      json_data = [
        { id: "1", name: "Carta 1", image_uris: { small: "url1" } },
        { id: "2", name: "Carta 2", colors: [ "W", "U" ] }
      ].to_json

      expect(Carta).to receive(:import_from_scryfall).once do |lote|
        expect(lote.size).to eq(2)
      end

      json_data.chars.each_slice(10) { |chunk| parser << chunk.join }
      parser.finish!
    end

    it "lança erro se a importação for cancelada" do
      importacao = create(:importacao_scryfall, status: :cancelado)
      parser_com_record = Scryfall::ParserCartasJson.new(record: importacao)

      expect {
        parser_com_record << '[{"id": "1"}]'
      }.to raise_error(Scryfall::ImportCancelledError)
    end
  end
end

RSpec.describe Scryfall::Importador do
  let(:importador) { Scryfall::Importador.new }
  let(:api_mock) { instance_double(Scryfall::Api) }

  before do
    allow(Scryfall::Api).to receive(:new).and_return(api_mock)
  end

  describe "#importar_simbolos" do
    it "atualiza o status para concluído após a importação" do
      importacao = create(:importacao_scryfall, tipo: :simbolos)
      allow(api_mock).to receive(:baixar_simbolos).and_return([ { "symbol" => "{W}" } ])
      allow(Simbolo).to receive(:import_from_scryfall)

      importador.importar_simbolos(record: importacao)

      expect(importacao.reload.status).to eq('concluido')
    end

    it "marca como falho se ocorrer um erro" do
      importacao = create(:importacao_scryfall, tipo: :simbolos)
      allow(api_mock).to receive(:baixar_simbolos).and_raise("Erro de rede")

      expect {
        importador.importar_simbolos(record: importacao)
      }.to raise_error("Erro de rede")

      expect(importacao.reload.status).to eq('falha')
      expect(importacao.mensagem_erro).to eq("Erro de rede")
    end
  end

  describe "#importar_cartas" do
    it "atualiza metadados e status" do
      importacao = create(:importacao_scryfall, tipo: :bulk_data)
      metadata = { "size" => 1, "download_uri" => "url", "updated_at" => Time.current }

      # Mock do download e do arquivo
      allow(api_mock).to receive(:baixar_todas_as_cartas).and_return([ "spec/fixtures/scryfall_sample.json", metadata ])

      # Criamos um arquivo de exemplo para o teste
      FileUtils.mkdir_p("spec/fixtures")
      File.write("spec/fixtures/scryfall_sample.json", [ { id: "1", name: "Teste" } ].to_json)

      allow(Carta).to receive(:import_from_scryfall)

      importador.importar_cartas(record: importacao)

      expect(importacao.reload.status).to eq('concluido')
      expect(importacao.metadata).to be_present

      File.delete("spec/fixtures/scryfall_sample.json")
    end
  end
end
