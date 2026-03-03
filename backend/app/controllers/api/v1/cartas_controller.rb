module Api
  module V1
    class CartasController < ApplicationController
      def index
        @cartas = Carta.includes(:faces)
        @cartas = @cartas.where("name ILIKE ?", "%#{params.dig(:filters, :name)}%") if params.dig(:filters, :name).present?
        @cartas = @cartas.where(set: params.dig(:filters, :set)) if params.dig(:filters, :set).present?
        @cartas = @cartas.order(params[:sort] || :name)
        @cartas = @cartas.page(params[:page]).per(params[:per_page] || 20)

        render_json_success(template: "api/v1/cartas/index", locals: { cartas: @cartas })
      end

      def show
        @carta = Carta.includes(:faces).find(params[:id])

        render_json_success(template: "api/v1/cartas/show_template", locals: { carta: @carta })
      end
    end
  end
end
