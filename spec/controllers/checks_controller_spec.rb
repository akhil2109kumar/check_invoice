require 'rails_helper'

RSpec.describe ChecksController, type: :controller do
  before do
    @company = Company.create(name: "Test Company")
    @invoice = Invoice.create(number: "INV123", company: @company)
    @check = Check.create(number: "CHK123", company: @company)
  end

  describe "GET #index" do
    it "assigns @checks and returns status 200" do
      get :index
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET #show" do
    it "assigns the requested check and invoices and returns status 200" do
      get :show, params: { id: @check.id }
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST #create" do
    context "with valid attributes" do
      it "creates a new check and redirects" do
        post :create, params: { check: { number: "CHK456", company_id: @company.id } }
        expect(response).to redirect_to(checks_path)
      end
    end
  end

  describe "GET #capture" do
    it "returns status 200" do
      get :capture
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST #process_capture" do
    context "with valid attributes" do
      it "creates a check and redirects" do
        post :process_capture, params: { check: { number: "CHK789", company_id: @company.id } }
        expect(response).to have_http_status(302)
      end
    end
  end
end
