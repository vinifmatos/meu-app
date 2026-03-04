module Api
  module V1
    class DecksController < ApplicationController
      skip_before_action :autenticar_usuario!, only: %i[index show]
      before_action :set_deck, only: %i[show update destroy validar]

      def index
        if params[:meus] == 'true' && current_user
          @decks = current_user.decks.order(updated_at: :desc)
        else
          @decks = Deck.all.order(updated_at: :desc)
        end
        render_json_success(template: "api/v1/decks/index", locals: { decks: @decks })
      end

      def show
        render_json_success(template: "api/v1/decks/show", locals: { deck: @deck })
      end

      def create
        @deck = current_user.decks.create!(deck_params)
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
