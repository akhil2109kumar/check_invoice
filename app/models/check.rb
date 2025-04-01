class Check < ApplicationRecord
  belongs_to :company
  has_many :check_invoices, dependent: :destroy
  has_many :invoices, through: :check_invoices

  has_one_attached :image

  attr_accessor :image_data
  attr_accessor :invoice_numbers
  after_save :assign_invoices

  private

  def assign_invoices
    return unless invoice_numbers.present?

    invoice_numbers_array = invoice_numbers.is_a?(String) ? invoice_numbers.split(",").map(&:strip) : invoice_numbers

    existing_invoices = company.invoices.where(number: invoice_numbers_array).index_by(&:number)

    invoice_numbers_array.each do |invoice_number|
      invoice = existing_invoices[invoice_number] || company.invoices.create(number: invoice_number)

      check_invoices.find_or_create_by(invoice: invoice) if invoice.persisted?
    end
  end
end
