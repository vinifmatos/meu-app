namespace :v1 do
  resource :config, only: :show, controller: "config"
  resources :usuarios
  resources :cartas, only: %i[index show]
end
