module Api
  module V1
    class DecksController < ApplicationController
      before_action :set_deck, only: %i[show update destroy validar]

      def index
        @decks = Deck.all.order(updated_at: :desc)
        render_json_success(template: "api/v1/decks/index", locals: { decks: @decks })
      end

      def show
        render_json_success(template: "api/v1/decks/show", locals: { deck: @deck })
      end

      def create
        # Temporário: associar ao primeiro usuário se não fornecido
        usuario = Usuario.find_by(id: params.dig(:data, :deck, :usuario_id)) || Usuario.first
        @deck = Deck.create!(deck_params.merge(usuario: usuario))
        render_json_success(template: "api/v1/decks/show", locals: { deck: @deck }, message: "Deck criado com sucesso")
      end

      def update
        @deck.update!(deck_params)
        render_json_success(template: "api/v1/decks/show", locals: { deck: @deck }, message: "Deck atualizado com sucesso")
      end

      def destroy
        @deck.destroy!
        render_json_success(status: :no_content)
      end

      def validar
        validador = ::Decks::Validador.new(@deck)
        erros = validador.validar!
        
        render_json_success(template: nil, data: { valido: erros.empty?, erros: erros })
      end

      private

      def set_deck
        @deck = Deck.includes(deck_cartas: :carta).find(params[:id])
      end

      def deck_params
        params.require(:data).require(:deck).permit(:nome, :formato)
      end
    end
  end
end
