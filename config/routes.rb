Rails.application.routes.draw do
  root "checks#capture"

  resources :companies do
    resources :invoices, only: [ :index ]
  end

  resources :invoices

  resources :checks do
    collection do
      get "capture"
      post "process_capture"
    end
  end

  resources :check_invoices, only: [ :create, :destroy ]
end
