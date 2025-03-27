require "base64"
require "tempfile"
class ChecksController < ApplicationController
  before_action :set_check, only: [ :show, :edit, :update, :destroy ]
  before_action :load_companies_and_invoices, only: [ :new, :edit, :create, :update, :capture, :process_capture ]

  def index
    @checks = Check.includes(:company, :invoices).order(created_at: :desc).all
  end

  def show
  end

  def new
    @check = Check.new
    @company_id = params[:company_id]
  end

  def edit
  end

  def create
    @check = Check.new(check_params)
    process_image_data

    if @check.save
      redirect_to checks_path, notice: "Check was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @check.update(check_params)
      redirect_to checks_path, notice: "Check was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @check.destroy
    redirect_to checks_path, notice: "Check was successfully deleted."
  end

  def capture
    @check = Check.new
    @invoices_by_company = {}

    # Group invoices by company for easier selection in the UI
    @companies.each do |company|
      @invoices_by_company[company.id] = company.invoices.pluck(:number, :id)
    end
  end

  def process_capture
    @check = Check.new(check_params)
    process_image_data

    if @check.save
      redirect_to checks_path, notice: "Check was successfully captured and saved."
    else
      load_companies_and_invoices
      render :capture, status: :unprocessable_entity
    end
  end

  private

  def process_image_data
    # Handle base64 image from webcam/camera if present
    if params[:check] && params[:check][:image_data].present?
      # Extract the data URL
      image_data = params[:check][:image_data]

      # Check if it's a data URL
      if image_data.start_with?("data:")
        # Remove the data URL prefix and decode
        content_type = image_data.split(";")[0].split(":")[1]
        encoded_data = image_data.split(",")[1]

        begin
          decoded_data = Base64.decode64(encoded_data)

          # Create a temp file and attach it
          temp_file = Tempfile.new([ "check", determine_extension(content_type) ])
          temp_file.binmode
          temp_file.write(decoded_data)
          temp_file.rewind

          @check.image.attach(io: temp_file, filename: "check_#{Time.now.to_i}#{determine_extension(content_type)}", content_type: content_type)
          temp_file.close
        rescue => e
          Rails.logger.error "Error processing image data: #{e.message}"
          # Don't fail silently in development
          raise e if Rails.env.development?
        end
      else
        Rails.logger.warn "Received image_data does not appear to be a data URL"
      end
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
      ".png" # Default extension
    end
  end

  def set_check
    @check = Check.find(params[:id])
  end

  def load_companies_and_invoices
    @companies = Company.all
    @invoices = Invoice.all
    # @invoices_by_company = Invoice.group_by(&:company_id)
  end

  def check_params
    params.require(:check).permit(:number, :company_id, :image, invoice_ids: [])
  end
end
