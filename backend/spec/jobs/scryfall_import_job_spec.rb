require 'rails_helper'

RSpec.describe ScryfallImportJob, type: :job do
  describe "#perform_later" do
    it "enfileira o job corretamente" do
      ActiveJob::Base.queue_adapter = :test
      expect {
        ScryfallImportJob.perform_later(1)
      }.to have_enqueued_job.with(1).on_queue("default")
    end
  end

  describe "#perform" do
    let(:record) { create(:importacao_scryfall, tipo: tipo) }
    let(:tipo) { :simbolos }

    it "levanta erro se o ID for nulo" do
      expect {
        ScryfallImportJob.new.perform(nil)
      }.to raise_error(ArgumentError, "Deve ser informado um ID válido")
    end

    context "quando o tipo é simbolos" do
      let(:tipo) { "simbolos" }

      it "chama o importador de simbolos" do
        allow(Scryfall).to receive(:importar_simbolos)
        ScryfallImportJob.new.perform(record.id)
        expect(Scryfall).to have_received(:importar_simbolos).with(record: record)
      end
    end

    context "quando o tipo é bulk_data" do
      let(:tipo) { "bulk_data" }

      it "chama o importador de cartas" do
        allow(Scryfall).to receive(:importar_cartas)
        ScryfallImportJob.new.perform(record.id)
        expect(Scryfall).to have_received(:importar_cartas).with(record: record)
      end
    end
  end
end
