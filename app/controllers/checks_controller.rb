require "base64"
require "tempfile"

class ChecksController < ApplicationController
  before_action :load_companies_and_invoices, only: [ :new, :create, :capture, :process_capture ]

  def index
    @checks = Check.includes(:company, :invoices).order(created_at: :desc).all
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

    @check.invoice_numbers = params[:check][:invoice_numbers] if params[:check][:invoice_numbers].present?

    if @check.save
      redirect_to checks_path, notice: "Check was successfully created."
    else
      load_companies_and_invoices
      render :new, status: :unprocessable_entity
    end
  end

  def process_capture
    @check = Check.new(check_params)

    process_image_data if params[:check][:image_data].present?

    if params[:check][:invoice_numbers].present?
      invoice_numbers = params[:check][:invoice_numbers].split(",").map(&:strip)
      @check.invoice_ids = Invoice.where(number: invoice_numbers, company_id: @check.company_id).pluck(:id)
    end

    if params[:check][:invoice_ids].present?
      @check.invoice_ids = params[:check][:invoice_ids].flat_map { |ids| ids.split.map(&:to_i) }
    end

    if @check.save
      redirect_to check_path(@check), notice: "Check was successfully captured and saved."
    else
      load_companies_and_invoices
      render :capture, status: :unprocessable_entity
    end
  end

  def capture
    @check = Check.new
    @invoices_by_company = {}

    @companies.each do |company|
      @invoices_by_company[company.id] = company.invoices.pluck(:number, :id)
    end
  end

  private

  def process_image_data
    return unless params[:check] && params[:check][:image_data].present?

    image_data = params[:check][:image_data]

    if image_data.start_with?("data:")
      content_type = image_data.split(";")[0].split(":")[1]
      encoded_data = image_data.split(",")[1]

      decoded_data = Base64.decode64(encoded_data)

      temp_file = Tempfile.new(["check", determine_extension(content_type)], binmode: true)
      temp_file.write(decoded_data)
      temp_file.rewind

      @check.image.attach(io: temp_file, filename: "check_#{Time.now.to_i}#{determine_extension(content_type)}", content_type: content_type)

    else
      Rails.logger.warn "Received image_data does not appear to be a data URL"
    end
  end

  def determine_extension(content_type)
    case content_type
    when "image/png"
      ".png"
    when "image/jpeg"
      ".jpg"
    when "image/gif"
      ".gif"
    else
      ".png"
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
