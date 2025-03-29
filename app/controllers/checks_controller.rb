require "base64"
require "tempfile"

class ChecksController < ApplicationController
  before_action :load_companies_and_invoices, only: [:new, :create, :capture, :process_capture]

  def index
    @checks = Check.includes(:company, :invoices).order(created_at: :desc)
  end

  def show
    @check = Check.find(params[:id])
    @invoices = @check.company.invoices
  end

  def new
    @check = Check.new
    @company_id = params[:company_id]
  end

  def create
    @check = Check.new(check_params)
    process_image_data

    if save_check_with_invoices
      redirect_to checks_path, notice: "Check was successfully created."
    else
      load_companies_and_invoices
      render :capture, status: :unprocessable_entity
    end
  end

  def capture
    @check = Check.new
    @invoices_by_company = invoices_by_company
  end

  def process_capture
    @check = Check.new(check_params)
    process_image_data

    assign_invoice_ids_from_numbers if params[:check][:invoice_numbers].present?
    assign_invoice_ids_from_params if params[:check][:invoice_ids].present?

    if @check.save
      redirect_to check_path(@check), notice: "Check was successfully captured and saved."
    else
      load_companies_and_invoices
      render :capture, status: :unprocessable_entity
    end
  end

  private

  def process_image_data
    return unless params[:check][:image_data].present?

    image_data = params[:check][:image_data]

    if valid_image_data?(image_data)
      attach_image(image_data)
    else
      Rails.logger.warn "Received image_data does not appear to be a data URL"
    end
  end

  def valid_image_data?(image_data)
    image_data.start_with?("data:")
  end

  def attach_image(image_data)
    content_type = image_data.split(";")[0].split(":")[1]
    encoded_data = image_data.split(",")[1]
    decoded_data = Base64.decode64(encoded_data)

    temp_file = Tempfile.new(["check", determine_extension(content_type)], binmode: true)
    temp_file.write(decoded_data)
    temp_file.rewind

    @check.image.attach(io: temp_file, filename: "check_#{Time.now.to_i}#{determine_extension(content_type)}", content_type: content_type)
  end

  def determine_extension(content_type)
    case content_type
    when "image/png" then ".png"
    when "image/jpeg" then ".jpg"
    when "image/gif" then ".gif"
    else ".png"
    end
  end

  def save_check_with_invoices
    assign_invoice_ids_from_numbers if params[:check][:invoice_numbers].present?
    @check.save
  end

  def assign_invoice_ids_from_numbers
    invoice_numbers = params[:check][:invoice_numbers].split(",").map(&:strip)
    @check.invoice_ids = Invoice.where(number: invoice_numbers, company_id: @check.company_id).pluck(:id)
  end

  def assign_invoice_ids_from_params
    @check.invoice_ids = params[:check][:invoice_ids].flat_map { |ids| ids.split.map(&:to_i) }
  end

  def invoices_by_company
    @companies.each_with_object({}) do |company, hash|
      hash[company.id] = company.invoices.pluck(:number, :id)
    end
  end

  def load_companies_and_invoices
    @companies = Company.all
    @invoices = Invoice.all
  end

  def check_params
    params.require(:check).permit(:number, :company_id, :invoice_numbers, :image_data, invoice_ids: [])
  end
end
