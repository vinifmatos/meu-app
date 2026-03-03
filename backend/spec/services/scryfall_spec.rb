require "rails_helper"

RSpec.describe Scryfall::ParserCartasJson do
  let(:parser) { Scryfall::ParserCartasJson.new }
  let(:tamanho_lote) { Scryfall::ParserCartasJson::BATCH_SIZE }

  describe "#<<" do
    it "acumula cartas no lote e as importa quando o tamanho do lote é atingido" do
      # Criamos um JSON com 2 cartas e um array raiz
      json_data = [
        { id: "1", name: "Carta 1", image_uris: { small: "url1" } },
        { id: "2", name: "Carta 2", colors: [ "W", "U" ] }
      ].to_json

      # Mock do método de importação para verificar se é chamado
      expect(Carta).to receive(:import_from_scryfall).once do |lote|
        expect(lote.size).to eq(2)
        expect(lote[0]["name"]).to eq("Carta 1")
        expect(lote[0]["image_uris"]["small"]).to eq("url1")
        expect(lote[1]["name"]).to eq("Carta 2")
        expect(lote[1]["colors"]).to eq([ "W", "U" ])
      end

      # Simulamos a leitura em chunks pequenos
      json_data.chars.each_slice(10) do |chunk|
        parser << chunk.join
      end

      parser.finish!
    end

    it "limpa a pilha (stack) após cada objeto raiz (carta) ser processado" do
      json_data = [ { id: "1", name: "Carta 1" } ].to_json

      # Forçamos a importação para garantir que o processo ocorreu
      allow(Carta).to receive(:import_from_scryfall)

      parser << json_data

      # A stack deve estar vazia após processar o objeto
      expect(parser.instance_variable_get(:@stack)).to be_empty
    end

    it "ignora o array raiz e foca nos objetos internos" do
      json_data = '[{"id": "1"}]'

      allow(Carta).to receive(:import_from_scryfall)

      # Processamos apenas a abertura do array raiz
      parser << "["
      expect(parser.instance_variable_get(:@stack)).to be_empty

      # Processamos o objeto interno
      parser << '{"id": "1"}'
      # Aqui a stack deve ter sido usada e limpa pelo end_object
      expect(parser.instance_variable_get(:@stack)).to be_empty
    end
  end

  describe "#finish!" do
    it "importa o lote remanescente se houver dados" do
      json_data = [ { id: "1" } ].to_json

      expect(Carta).to receive(:import_from_scryfall).with([ hash_including("id" => "1") ])

      parser << json_data
      parser.finish!
    end

    it "não faz nada se o lote estiver vazio" do
      expect(Carta).not_to receive(:import_from_scryfall)
      parser.finish!
    end
  end
end
