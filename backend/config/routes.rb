Rails.application.routes.draw do
  get "config/show"
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    draw :v1
  end
end
