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
  let(:symbols_path) { File.join(data_dir, "simbolos.json.bz2") }
  let(:bulk_path_old) { File.join(data_dir, "all-cards-20260101000000.json.bz2") }
  let(:bulk_path_new) { File.join(data_dir, "all-cards-20260308092214.json.bz2") }

  before do
    Simbolo.delete_all
    Carta.delete_all
    FileUtils.mkdir_p(data_dir)
    allow(ENV).to receive(:fetch).with('SCRYFALL_DATA_DIR').and_return(data_dir.to_s)
  end

  after do
    FileUtils.rm_rf(data_dir)
  end

  def compress_to_bzip(content, path)
    IO.popen([ "bzip2", "-c" ], "r+") do |pipe|
      pipe.write(content)
      pipe.close_write
      File.write(path, pipe.read)
    end
  end

  describe ".importar_simbolos" do
    let(:record) { create(:importacao_scryfall, tipo: :simbolos) }

    it "importa os símbolos com sucesso de um arquivo bzip2" do
      fixture_content = File.read(Rails.root.join("spec", "fixtures", "simbolos.json"))
      compress_to_bzip(fixture_content, symbols_path)

      expect {
        Scryfall.importar_simbolos(record: record)
      }.to change(Simbolo, :count)

      record.reload
      expect(record.status).to eq("concluido")
    end

    it "lança erro se the file does not exist" do
      expect {
        Scryfall.importar_simbolos(record: record)
      }.to raise_error(Scryfall::ImportError, /não encontrado/)

      expect(record.reload.status).to eq("falha")
    end
  end

  describe ".importar_cartas" do
    let(:record) { create(:importacao_scryfall, tipo: :bulk_data) }

    it "importa cartas com sucesso do arquivo bzip2 mais recente" do
      fixture_content = File.read(Rails.root.join("spec", "fixtures", "cartas.json"))
      
      compress_to_bzip("[]", bulk_path_old)
      compress_to_bzip(fixture_content, bulk_path_new)

      expect {
        Scryfall.importar_cartas(record: record)
      }.to change(Carta, :count)

      record.reload
      expect(record.status).to eq("concluido")
      expect(record.file_path).to eq(bulk_path_new.to_s)
    end

    context "cancellation" do
      it "interrompe a importação se o record for marcado como cancelado" do
        fixture_content = File.read(Rails.root.join("spec", "fixtures", "cartas.json"))
        compress_to_bzip(fixture_content, bulk_path_new)

        # Simular cancelamento já no banco
        record.update!(status: :cancelado, finished_at: Time.current)

        # Garantir que o reload não mude o status
        allow(record).to receive(:reload).and_return(record)

        Scryfall.importar_cartas(record: record)

        expect(record.reload.status).to eq("cancelado")
      end
    end
  end
end
