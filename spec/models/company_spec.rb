require 'rails_helper'

RSpec.describe Company, type: :model do

  describe "Associations" do
    it { should have_many(:invoices).dependent(:destroy) }
    it { should have_many(:checks).dependent(:destroy) }
  end

  describe "Validations" do
    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:name) }
  end
end
