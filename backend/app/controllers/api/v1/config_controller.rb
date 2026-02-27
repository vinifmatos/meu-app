class Api::V1::ConfigController < ApplicationController
  def show
    config = {
      app_name: Rails.application.class.module_parent_name,
      version: Version.to_s,
      api_version: Version.api_version,
      environment: Rails.env
    }

    render_json_success(template: nil, data: config)
  end
end
