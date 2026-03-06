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
  let(:importer) { Scryfall::Importador.new }

  describe "#importar_simbolos" do
    let(:record) { create(:importacao_scryfall, tipo: :simbolos) }

    it "importa os símbolos com sucesso", vcr: { cassette_name: 'scryfall/symbology' } do
      expect {
        importer.importar_simbolos(record: record)
      }.to change(Simbolo, :count)

      record.reload
      expect(record.status).to eq("concluido")
      expect(record.progresso).to eq(100)
      expect(record.started_at).to be_present
      expect(record.finished_at).to be_present
    end

    it "marca como falha se a API retornar erro", vcr: { cassette_name: 'scryfall/symbology_error' } do
      # Simular erro na API interceptando a chamada
      allow_any_instance_of(Scryfall::Api).to receive(:baixar_simbolos).and_raise(Scryfall::ApiError, "API Error")

      expect {
        importer.importar_simbolos(record: record)
      }.to raise_error(Scryfall::ApiError, "API Error")

      record.reload
      expect(record.status).to eq("falha")
      expect(record.mensagem_erro).to eq("API Error")
      expect(record.finished_at).to be_present
    end
  end

  describe "#importar_cartas" do
    let(:record) { create(:importacao_scryfall, tipo: :bulk_data) }

    context "cancellation" do
      it "interrompe a importação se o record for marcado como cancelado" do
        # Criar um arquivo temporário para simular o bulk data
        file_path = Rails.root.join("tmp", "scryfall_test_bulk.json")
        File.write(file_path, [{ name: "Black Lotus" }].to_json)

        allow_any_instance_of(Scryfall::Api).to receive(:baixar_todas_as_cartas).and_return([file_path.to_s, { "size" => 100 }])

        # Simular cancelamento antes de processar o primeiro chunk
        allow(record).to receive(:reload).and_return(record)
        allow(record).to receive(:cancelado?).and_return(true)

        importer.importar_cartas(record: record)

        record.reload
        expect(record.status).to eq("cancelado")

        File.delete(file_path) if File.exist?(file_path)
      end
    end
  end
end
