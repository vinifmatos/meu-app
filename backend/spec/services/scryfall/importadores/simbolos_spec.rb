require "rails_helper"

RSpec.describe Scryfall::Importadores::Simbolos do
  let(:record) { create(:importacao_scryfall, tipo: :simbolos) }
  let(:importador) { described_class.new(record: record) }
  let(:data_dir) { Rails.root.join("spec/fixtures/scryfall") }
  let(:fixture_path) { Rails.root.join("spec/fixtures/simbolos.json") }

  before do
    allow(ENV).to receive(:fetch).with("SCRYFALL_DATA_DIR").and_return(data_dir.to_s)
    FileUtils.mkdir_p(data_dir)
  end

  describe "#importar" do
    let(:bz2_path) { File.join(data_dir, "simbolos.json.bz2") }

    before do
      # Criar um arquivo bz2 real a partir da fixture existente de forma programática
      File.open(bz2_path, "wb") do |bz2_file|
        IO.popen([ "bzip2", "-c", fixture_path.to_s ], "rb") do |io|
          bz2_file.write(io.read)
        end
      end
    end

    after do
      FileUtils.rm_rf(data_dir)
    end

    it "descompacta e importa os símbolos corretamente" do
      # Conta quantos objetos tem na fixture
      fixture_count = JSON.parse(File.read(fixture_path)).size

      expect {
        importador.importar
      }.to change(Simbolo, :count).by(fixture_count)

      expect(record.reload.status).to eq("concluido")
      expect(Simbolo.find_by(symbol: "{W}")).to be_present
    end

    it "levanta erro se o bzcat falhar" do
      # Corromper o arquivo
      File.binwrite(bz2_path, "not a bz2 file")

      expect {
        importador.importar
      }.to raise_error(Scryfall::ImportError, /Erro ao descompactar/)

      expect(record.reload.status).to eq("falha")
    end
  end
end
