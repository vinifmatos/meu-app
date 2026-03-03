class ScryfallImportJob < ApplicationJob
  queue_as :default

  def perform
    ScryfallApi.import_data
  end
end
