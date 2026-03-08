require "rails_helper"

RSpec.describe Scryfall::ParserCartasJson do
  let(:parser) { Scryfall::ParserCartasJson.new }

  describe "#<<" do
    it "acumula cartas no lote e as importa quando o tamanho do lote é atingido" do
      json_data = [
        { id: SecureRandom.uuid, name: "Carta 1", lang: "en", image_uris: { small: "url1" } },
        { id: SecureRandom.uuid, name: "Carta 2", lang: "en", colors: [ "W", "U" ] }
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

RSpec.describe Scryfall do
  let(:data_dir) { Rails.root.join("tmp", "scryfall_test_data") }
  let(:symbols_path) { File.join(data_dir, "simbolos.json.bzip") }
  let(:bulk_path_old) { File.join(data_dir, "all-cards-20260101000000.json.bz2") }
  let(:bulk_path_new) { File.join(data_dir, "all-cards-20260308092214.json.bz2") }

  before do
    FileUtils.mkdir_p(data_dir)
    allow(ENV).to receive(:fetch).with('SCRYFALL_DATA_DIR').and_return(data_dir.to_s)
  end

  after do
    FileUtils.rm_rf(data_dir)
  end

  def compress_to_bzip(content, path)
    IO.popen(["bzip2", "-c"], "r+") do |pipe|
      pipe.write(content)
      pipe.close_write
      File.write(path, pipe.read)
    end
  end

  describe ".importar_simbolos" do
    let(:record) { create(:importacao_scryfall, tipo: :simbolos) }

    it "importa os símbolos com sucesso de um arquivo bzip2" do
      content = { 
        data: [ 
          { 
            symbol: "{W}", 
            english: "White", 
            represents_mana: true, 
            appears_in_mana_costs: true, 
            colors: ["W"],
            hybrid: false,
            phyrexian: false
          } 
        ] 
      }.to_json
      compress_to_bzip(content, symbols_path)

      expect {
        Scryfall.importar_simbolos(record: record)
      }.to change(Simbolo, :count).by(1)

      record.reload
      expect(record.status).to eq("concluido")
    end

    it "lança erro se o arquivo não existir" do
      expect {
        Scryfall.importar_simbolos(record: record)
      }.to raise_error(Scryfall::ImportError, /não encontrado/)

      expect(record.reload.status).to eq("falha")
    end
  end

  describe ".importar_cartas" do
    let(:record) { create(:importacao_scryfall, tipo: :bulk_data) }

    it "importa cartas com sucesso do arquivo bzip2 mais recente" do
      old_content = [ { id: SecureRandom.uuid, name: "Old Card", lang: "en" } ].to_json
      new_content = [ { id: SecureRandom.uuid, name: "New Card", lang: "en", scryfall_id: SecureRandom.uuid } ].to_json
      
      compress_to_bzip(old_content, bulk_path_old)
      compress_to_bzip(new_content, bulk_path_new)

      expect {
        Scryfall.importar_cartas(record: record)
      }.to change(Carta, :count).by(1)

      record.reload
      expect(record.status).to eq("concluido")
      expect(record.metadata["file_path"]).to eq(bulk_path_new.to_s)
      expect(Carta.find_by(name: "New Card")).to be_present
      expect(Carta.find_by(name: "Old Card")).not_to be_present
    end

    context "cancellation" do
      it "interrompe a importação se o record for marcado como cancelado" do
        content = [ { name: "Black Lotus", lang: "en", id: SecureRandom.uuid } ].to_json
        compress_to_bzip(content, bulk_path_new)

        # Simular cancelamento
        allow(record).to receive(:reload).and_return(record)
        allow(record).to receive(:cancelado?).and_return(true)

        Scryfall.importar_cartas(record: record)

        record.reload
        expect(record.status).to eq("cancelado")
      end
    end
  end
end
