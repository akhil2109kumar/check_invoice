Rails.application.routes.draw do
  root "checks#capture"

  resources :companies, only: [ :index ]
  resources :invoices, only: [ :index ]

  resources :checks do
    collection do
      get "unique_check_number"
      get "unique_invoice_numbers"
      get "capture"
      post "process_capture"
    end
  end
end
