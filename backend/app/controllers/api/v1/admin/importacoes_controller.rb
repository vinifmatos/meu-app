module Api
  module V1
    module Admin
      class ImportacoesController < ApplicationController
        before_action :exige_admin!

        def index
          @importacoes = ImportacaoScryfall.all.order(created_at: :desc).limit(50)
          render_json_success(template: "api/v1/admin/importacoes/index", locals: { importacoes: @importacoes })
        end

        def create
          @importacao = ImportacaoScryfall.create!(importacao_params)

          ScryfallImportJob.perform_later(
            @importacao.id,
            force: params[:data][:force] == true
          )

          render_json_success(
            template: "api/v1/admin/importacoes/show",
            locals: { importacao: @importacao },
            status: :created,
            message: "Importação de #{@importacao.tipo} iniciada em segundo plano"
          )
        end

        def destroy
          @importacao = ImportacaoScryfall.find(params[:id])

          if @importacao.processando? || @importacao.pendente?
            @importacao.update!(status: :cancelado, finished_at: Time.current)
            render_json_success(template: nil, message: "Importação marcada para cancelamento")
          else
            render_json_error(message: "Esta importação não pode ser cancelada (Status: #{@importacao.status})", status: :bad_request)
          end
        end

        private

        def importacao_params
          params.require(:data).require(:importacao).permit(:tipo)
        end
      end
    end
  end
end
