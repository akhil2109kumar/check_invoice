Rails.application.routes.draw do
  get "check_invoices/create"
  get "check_invoices/destroy"
  get "checks/index"
  get "checks/new"
  get "checks/create"
  get "checks/show"
  get "checks/edit"
  get "checks/update"
  get "checks/destroy"
  get "invoices/index"
  get "invoices/new"
  get "invoices/create"
  get "invoices/edit"
  get "invoices/update"
  get "invoices/destroy"
  get "companies/index"
  get "companies/new"
  get "companies/create"
  get "companies/edit"
  get "companies/update"
  get "companies/destroy"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
