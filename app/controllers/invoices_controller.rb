# app/controllers/invoices_controller.rb
class InvoicesController < ApplicationController
  before_action :load_companies, only: [ :new, :create, ]

  def index
    if params[:company_id]
      @company = Company.find(params[:company_id])
      @invoices = @company.invoices

      respond_to do |format|
        format.html
        format.json { render json: @invoices.as_json(only: [ :id, :number ]) }
      end
    else
      @invoices = Invoice.includes(:company).all

      respond_to do |format|
        format.html
        format.json { render json: @invoices }
      end
    end
  end

  def new
    @invoice = Invoice.new
  end

  def create
    @invoice = Invoice.new(invoice_params)

    if @invoice.save
      redirect_to invoices_path, notice: "Invoice was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_invoice
    @invoice = Invoice.find(params[:id])
  end

  def load_companies
    @companies = Company.all
  end

  def invoice_params
    params.require(:invoice).permit(:number, :company_id)
  end
end
