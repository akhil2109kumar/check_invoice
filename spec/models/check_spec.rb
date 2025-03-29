require 'rails_helper'

RSpec.describe Check, type: :model do
  let(:company) { Company.create(name: "Test Company") }
  let!(:existing_check) { Check.create(number: "CHK123", company: company) }

  describe "Associations" do
    it { should belong_to(:company) }
    it { should have_many(:check_invoices).dependent(:destroy) }
    it { should have_many(:invoices).through(:check_invoices) }
  end

  describe "Validations" do
    it "validates uniqueness of :number within the scope of :company_id" do
      new_check = Check.new(number: "CHK123", company: company)

      expect(new_check).not_to be_valid
      expect(new_check.errors[:number]).to include("Check number should be unique within the company")
    end
  end

  describe "#assign_invoices" do
    let(:invoice_numbers) { ['INV123', 'INV124'] }

    it "creates invoices if they don't exist" do
      check_with_invoices = Check.create(number: "CHK125", company: company, invoice_numbers: invoice_numbers)

      expect(Invoice.count).to eq(2)
    end

    it "associates the correct invoices with the check" do
      check_with_invoices = Check.create(number: "CHK126", company: company, invoice_numbers: invoice_numbers)

      check_with_invoices.save

      invoice_numbers.each do |number|
        invoice = company.invoices.find_by(number: number)
        expect(invoice.checks).to include(check_with_invoices)
      end
    end

    it "does not create duplicate check_invoices for the same invoice_number" do
      check_with_invoices = Check.create(number: "CHK127", company: company, invoice_numbers: invoice_numbers)
      check_with_invoices.save

      check_with_invoices.update(invoice_numbers: ['INV123', 'INV124'])

      expect(check_with_invoices.check_invoices.count).to eq(2)
    end
  end
end
