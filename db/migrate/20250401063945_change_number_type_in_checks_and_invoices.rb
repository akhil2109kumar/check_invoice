class ChangeNumberTypeInChecksAndInvoices < ActiveRecord::Migration[7.0]
  def up
    change_column :checks, :number, 'integer USING number::integer'
    change_column :invoices, :number, 'integer USING number::integer'
  end

  def down
    change_column :checks, :number, :string
    change_column :invoices, :number, :string
  end
end
