namespace :v1 do
  resource :config, only: :show, controller: "config"
  
  post "auth/login", to: "auth#login"
  post "auth/refresh", to: "auth#refresh"

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
