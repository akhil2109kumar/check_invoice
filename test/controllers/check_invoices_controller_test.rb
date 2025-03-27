require "test_helper"

class CheckInvoicesControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get check_invoices_create_url
    assert_response :success
  end

  test "should get destroy" do
    get check_invoices_destroy_url
    assert_response :success
  end
end
