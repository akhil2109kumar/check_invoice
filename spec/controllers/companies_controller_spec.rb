require 'rails_helper'

RSpec.describe CompaniesController, type: :controller do
  let(:valid_attributes) { { name: "Test Company" } }
  let(:invalid_attributes) { { name: "" } }
  let(:company) { Company.create!(valid_attributes) }

  describe "GET #index" do
    it "returns a success response" do
      Company.create!(valid_attributes)
      get :index
      expect(response).to be_successful
    end
  end

  describe "GET #new" do
    it "returns a success response" do
      get :new
      expect(response).to be_successful
    end
  end

  describe "POST #create" do
    context "with valid parameters" do
      it "creates a new Company" do
        expect {
          post :create, params: { company: valid_attributes }
        }.to change(Company, :count).by(1)
      end

      it "redirects to the companies index with a notice" do
        post :create, params: { company: valid_attributes }
        expect(response).to redirect_to(companies_path)
        expect(flash[:notice]).to eq("Company was successfully created.")
      end
    end

    context "with invalid parameters" do
      it "does not create a new Company" do
        expect {
          post :create, params: { company: invalid_attributes }
        }.to_not change(Company, :count)
      end
    end
  end

  describe "GET #edit" do
    it "returns a success response" do
      get :edit, params: { id: company.id }
      expect(response).to be_successful
    end
  end

  describe "PATCH #update" do
    context "with valid parameters" do
      let(:new_attributes) { { name: "Updated Company" } }

      it "updates the requested company" do
        patch :update, params: { id: company.id, company: new_attributes }
        company.reload
        expect(company.name).to eq("Updated Company")
      end

      it "redirects to the companies index with a notice" do
        patch :update, params: { id: company.id, company: new_attributes }
        expect(response).to redirect_to(companies_path)
        expect(flash[:notice]).to eq("Company was successfully updated.")
      end
    end

    context "with invalid parameters" do
      it "does not update the requested company" do
        patch :update, params: { id: company.id, company: invalid_attributes }
        company.reload
        expect(company.name).not_to eq("")
      end
    end
  end
end
