# app/controllers/check_invoices_controller.rb
class CheckInvoicesController < ApplicationController
  def create
    @check_invoice = CheckInvoice.new(check_invoice_params)

    if @check_invoice.save
      redirect_to check_path(@check_invoice.check), notice: "Invoice successfully linked."
    else
      redirect_to check_path(@check_invoice.check), alert: "Failed to link invoice."
    end
  end

  def destroy
    @check_invoice = CheckInvoice.find(params[:id])
    @check = @check_invoice.check
    @check_invoice.destroy

    redirect_to check_path(@check), notice: "Invoice link removed."
  end

  private

  def check_invoice_params
    params.require(:check_invoice).permit(:check_id, :invoice_id)
  end
end
