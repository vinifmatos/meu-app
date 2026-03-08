module Api
  module V1
    module Decks
      class CartasController < ApplicationController
        before_action :set_deck
        before_action :verificar_proprietario!

        def create
          # Busca se a carta já existe no deck
          deck_carta = @deck.deck_cartas.find_or_initialize_by(carta_id: carta_params[:carta_id])

          # Se for marcada como comandante, precisamos garantir que o formato permita
          # e que outras não sejam comandantes
          if carta_params[:eh_comandante]
            deck_carta.eh_comandante = true
            deck_carta.quantidade = 1
          else
            deck_carta.quantidade = (deck_carta.quantidade || 0) + (carta_params[:quantidade] || 1).to_i
          end

          deck_carta.save!

          render_json_success(template: "api/v1/decks/show", locals: { deck: @deck.reload }, message: "Carta adicionada ao deck")
        end

        def destroy
          deck_carta = @deck.deck_cartas.find_by!(carta_id: params[:id])

          if deck_carta.quantidade > 1 && params[:tudo] != "true"
            deck_carta.decrement!(:quantidade)
          else
            deck_carta.destroy!
          end

          render_json_success(template: "api/v1/decks/show", locals: { deck: @deck.reload }, message: "Carta removida do deck")
        end

        private

        def set_deck
          @deck = Deck.find(params[:deck_id])
        end

        def verificar_proprietario!
          unless @deck.usuario_id == current_user.id
            render_json_error(message: "Acesso negado: este deck não pertence a você", status: :forbidden)
          end
        end

        def carta_params
          params.require(:data).require(:deck_carta).permit(:carta_id, :quantidade, :eh_comandante)
        end
      end
    end
  end
end
