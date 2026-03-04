module Api
  module V1
    class SimbolosController < ApplicationController
      skip_before_action :carregar_usuario_atual, only: :index
      skip_before_action :autenticar_usuario!, only: :index

      def index
        @simbolos = Simbolo.all.order(:symbol)
        render_json_success(template: "api/v1/simbolos/index", locals: { simbolos: @simbolos })
      end
    end
  end
end
