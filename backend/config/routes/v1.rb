namespace :v1 do
  resource :config, only: :show, controller: "config"
  resources :usuarios
  resources :cartas, only: %i[index show]
  resources :simbolos, only: :index
  resources :decks do
    scope module: :decks do
      resources :cartas, only: %i[create destroy]
    end
    get :validar, on: :member
  end
end
