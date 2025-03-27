class CheckInvoice < ApplicationRecord
  belongs_to :check
  belongs_to :invoice

  validates :check_id, uniqueness: { scope: :invoice_id }
end
