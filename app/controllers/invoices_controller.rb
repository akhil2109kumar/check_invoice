# app/controllers/invoices_controller.rb
class InvoicesController < ApplicationController

  def index
    @invoices = Invoice.all
  end
end
