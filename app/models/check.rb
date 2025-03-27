class Check < ApplicationRecord
  belongs_to :company
  has_many :check_invoices, dependent: :destroy
  has_many :invoices, through: :check_invoices

  has_one_attached :image

  validates :number, presence: true, uniqueness: { scope: :company_id }

  attr_accessor :invoice_ids

  after_save :link_invoices

  private

  def link_invoices
    return unless invoice_ids.present?

    # Convert to array if it's a string
    ids = invoice_ids.is_a?(String) ? invoice_ids.split(",") : invoice_ids

    # Clear existing associations and create new ones
    check_invoices.destroy_all
    ids.each do |invoice_id|
      check_invoices.create(invoice_id: invoice_id) if invoice_id.present?
    end
  end
end
