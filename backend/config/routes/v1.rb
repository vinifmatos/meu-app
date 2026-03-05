namespace :v1 do
  resource :config, only: :show, controller: "config"

  post "auth/login", to: "auth#login"
  post "auth/refresh", to: "auth#refresh"
  delete "auth/logout", to: "auth#logout"

  resources :registro_usuarios, only: :create do
    get :confirmar, on: :collection
  end

  resource :perfil, only: [:show, :update], controller: "perfil"

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

