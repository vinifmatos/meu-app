module Api
  module V1
    class CartasController < ApplicationController
      def index
        idioma = params.dig(:filters, :lang) || "en"

        # Prioridade: Idioma selecionado > Inglês > Outros
        priority_sql = <<~SQL.squish
          CASE
            WHEN lang = #{Carta.connection.quote(idioma)} THEN 1
            WHEN lang = 'en' THEN 2
            ELSE 3
          END
        SQL

        @cartas = Carta.includes(:faces)
                       .select("DISTINCT ON (cartas.oracle_id) cartas.*, #{priority_sql} AS lang_priority")
                       .order("cartas.oracle_id, lang_priority ASC, cartas.released_at DESC")

        # Filtros Adicionais
        if params.dig(:filters, :name).present?
          @cartas = @cartas.where("cartas.name ILIKE ?", "%#{params.dig(:filters, :name)}%")
        end

        if params.dig(:filters, :set).present?
          @cartas = @cartas.where(set: params.dig(:filters, :set))
        end

        if params.dig(:filters, :oracle_id).present?
          @cartas = @cartas.where(oracle_id: params.dig(:filters, :oracle_id))
        end

        # Quando filtramos por oracle_id e set especificamente, queremos o registro exato, 
        # ignorando o DISTINCT ON da listagem geral se necessário.
        if params.dig(:filters, :oracle_id).present? && params.dig(:filters, :set).present?
           @cartas = Carta.includes(:faces)
                          .where(oracle_id: params.dig(:filters, :oracle_id), set: params.dig(:filters, :set), lang: idioma)
        end

        @cartas = Carta.from("(#{@cartas.to_sql}) AS cartas")
                       .order(Arel.sql("COALESCE(cartas.printed_name, cartas.name) ASC"))
                       .page(params[:page])
                       .per(params[:per_page] || 20)

        render_json_success(template: "api/v1/cartas/index", locals: { cartas: @cartas })
      end

      def show
        @carta = Carta.includes(:faces).find(params[:id])

        # No detalhe, as outras impressões devem seguir o idioma da CARTA ATUAL
        @versoes = Carta.where(oracle_id: @carta.oracle_id)
                        .where(lang: @carta.lang)
                        .order(released_at: :desc)

        render_json_success(template: "api/v1/cartas/show_template", locals: { carta: @carta, versoes: @versoes })
      end
    end
  end
end
