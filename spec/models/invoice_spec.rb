require 'rails_helper'

RSpec.describe Invoice, type: :model do

  describe "Associations" do
    it { should belong_to(:company) }
    it { should have_many(:check_invoices).dependent(:destroy) }
    it { should have_many(:checks).through(:check_invoices) }
  end

  describe "Validations" do
    it { should validate_presence_of(:number) }
  end
end
