module Api
  module V1
    class CartasController < ApplicationController
      skip_before_action :autenticar_usuario!, only: %i[index show]

      def index
        idioma = params.dig(:filters, :lang) || "en"

        priority_sql = <<~SQL.squish
          CASE
            WHEN lang = #{Carta.connection.quote(idioma)} THEN 1
            WHEN lang = 'en' THEN 2
            ELSE 3
          END
        SQL

        @cartas = Carta.includes(:faces)
                       .select("DISTINCT ON (cartas.oracle_id) cartas.*, #{priority_sql} AS lang_priority")

        # Full-Text Search com suporte a prefixo (busca parcial)
        if params.dig(:filters, :name).present?
          termo = params.dig(:filters, :name).strip
          query_parcial = termo.split(/\s+/).map { |w| "#{w}:*" }.join(" & ")

          oracle_ids = Carta.where(lang: [ idioma, "en" ])
                            .where("search_vector @@ to_tsquery('simple', ?)", query_parcial)
                            .distinct
                            .pluck(:oracle_id)

          @cartas = @cartas.where(oracle_id: oracle_ids)
        end

        if params.dig(:filters, :type_line).present?
          @cartas = @cartas.where("cartas.type_line ILIKE ?", "%#{params.dig(:filters, :type_line)}%")
        end

        if params.dig(:filters, :colors).present?
          cores = Array(params.dig(:filters, :colors)).to_json
          @cartas = @cartas.where("cartas.colors @> ?::jsonb", cores)
        end

        if params.dig(:filters, :color_identity).present?
          identidade = Array(params.dig(:filters, :color_identity))
          @cartas = @cartas.where("ARRAY(SELECT jsonb_array_elements_text(cartas.color_identity))::text[] <@ ARRAY[?]::text[]", identidade)
        end

        if params.dig(:filters, :set).present?
          @cartas = @cartas.where(set: params.dig(:filters, :set))
        end

        if params.dig(:filters, :oracle_id).present?
          @cartas = @cartas.where(oracle_id: params.dig(:filters, :oracle_id))
        end

        @cartas = @cartas.order("cartas.oracle_id, lang_priority ASC, cartas.released_at DESC")

        @cartas = Carta.includes(:faces)
                       .from("(#{@cartas.to_sql}) AS cartas")
                       .select("cartas.*")

        # Ordenação final livre (agora podemos ordenar por nome sem oracle_id na frente)
        ordenacao = Arel.sql("COALESCE(cartas.printed_name, cartas.name) ASC")

        @cartas = @cartas.order(ordenacao)
                         .page(params[:page])
                         .per(params[:per_page] || 20)

        render_json_success(template: "api/v1/cartas/index", locals: { cartas: @cartas })
        end
      def show
        @carta = Carta.includes(:faces).find(params[:id])

        @versoes = Carta.where(oracle_id: @carta.oracle_id)
                        .where(lang: @carta.lang)
                        .order(released_at: :desc)

        render_json_success(template: "api/v1/cartas/show_template", locals: { carta: @carta, versoes: @versoes })
      end
    end
  end
end
