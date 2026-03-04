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

RSpec.describe Scryfall::Importador do
  let(:importador) { Scryfall::Importador.new }
  let(:api_mock) { instance_double(Scryfall::Api) }

  before do
    allow(Scryfall::Api).to receive(:new).and_return(api_mock)
  end

  describe "#importar_carta_por_nome" do
    it "busca a carta na API e chama o método de importação do modelo" do
      carta_data = { "id" => "123", "name" => "Black Lotus", "legalities" => {} }
      expect(api_mock).to receive(:buscar_carta_por_nome).with("Black Lotus", lang: nil).and_return(carta_data)
      expect(Carta).to receive(:import_from_scryfall).with([carta_data])

      importador.importar_carta_por_nome("Black Lotus")
    end

    it "suporta importar em um idioma específico" do
      carta_data = { "id" => "123", "name" => "Lótus Negra", "lang" => "pt", "legalities" => {} }
      expect(api_mock).to receive(:buscar_carta_por_nome).with("Black Lotus", lang: "pt").and_return(carta_data)
      expect(Carta).to receive(:import_from_scryfall).with([carta_data])

      importador.importar_carta_por_nome("Black Lotus", lang: "pt")
    end

    it "lança erro se a carta não for encontrada" do
      expect(api_mock).to receive(:buscar_carta_por_nome).with("Carta Inexistente", lang: nil).and_return(nil)
      expect(Carta).not_to receive(:import_from_scryfall)

      expect {
        importador.importar_carta_por_nome("Carta Inexistente")
      }.to raise_error(Scryfall::ImportError, /não encontrada/)
    end
  end
end
