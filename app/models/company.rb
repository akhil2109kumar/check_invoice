class Company < ApplicationRecord
  has_many :invoices, dependent: :destroy
  has_many :checks, dependent: :destroy

  validates :name, presence: true, uniqueness: true
end
