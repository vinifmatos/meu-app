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

        if params.dig(:filters, :name).present?
          @cartas = @cartas.where("cartas.name ILIKE ?", "%#{params.dig(:filters, :name)}%")
        end

        if params.dig(:filters, :set).present?
          @cartas = @cartas.where(set: params.dig(:filters, :set))
        end

        @cartas = Carta.from("(#{@cartas.to_sql}) AS cartas")
                       .order(Arel.sql("COALESCE(cartas.printed_name, cartas.name) ASC"))
                       .page(params[:page])
                       .per(params[:per_page] || 20)

        render_json_success(template: "api/v1/cartas/index", locals: { cartas: @cartas })
      end

      def show
        @carta = Carta.includes(:faces).find(params[:id])

        # Busca todas as impressões da mesma carta (mesmo oracle_id)
        @versoes = Carta.where(oracle_id: @carta.oracle_id).order(released_at: :desc)

        # Aplica filtro de idioma se fornecido
        if params[:idioma].present?
          @versoes = @versoes.where(lang: params[:idioma])
        end

        render_json_success(template: "api/v1/cartas/show_template", locals: { carta: @carta, versoes: @versoes })
      end
    end
  end
end
