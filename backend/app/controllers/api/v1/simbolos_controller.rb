module Api
  module V1
    class SimbolosController < ApplicationController
      def index
        @simbolos = Simbolo.all.order(:symbol)
        render_json_success(template: "api/v1/simbolos/index", locals: { simbolos: @simbolos })
      end
    end
  end
end
