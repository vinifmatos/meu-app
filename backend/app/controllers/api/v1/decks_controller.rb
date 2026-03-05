module Api
  module V1
    class DecksController < ApplicationController
      skip_before_action :autenticar_usuario!, only: %i[index show]
      before_action :set_deck, only: %i[show update destroy validar]
      before_action :verificar_proprietario!, only: %i[update destroy]

      def index
        if params[:meus] == 'true'
          if current_user
            @decks = current_user.decks.order(updated_at: :desc)
          else
            return render_json_error(message: "Você precisa estar logado para ver seus decks", status: :unauthorized)
          end
        else
          @decks = Deck.all.order(updated_at: :desc)
        end
        render_json_success(template: "api/v1/decks/index", locals: { decks: @decks })
      end

      def show
        render_json_success(template: "api/v1/decks/show", locals: { deck: @deck })
      end

      def create
        @deck = current_user.decks.new(deck_params.except(:cartas_attributes))
        
        if deck_params[:cartas_attributes].present?
          @deck.deck_cartas_attributes = deck_params[:cartas_attributes]
        end

        @deck.save!
        render_json_success(template: "api/v1/decks/show", locals: { deck: @deck }, message: "Deck criado com sucesso", status: :created)
      end

      def update
        if deck_params[:cartas_attributes].present?
          @deck.deck_cartas.delete_all
        end

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

      def verificar_proprietario!
        unless @deck.usuario_id == current_user.id
          render_json_error(message: "Acesso negado: este deck não pertence a você", status: :forbidden)
        end
      end

      def deck_params
        params.require(:data).require(:deck).permit(
          :nome, 
          :formato, 
          cartas_attributes: [:carta_id, :quantidade, :eh_comandante]
        )
      end
    end
  end
end
