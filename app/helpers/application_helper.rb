module ApplicationHelper
  def nav_link_class(path)
    base = "rounded-md px-3 py-2 text-base font-medium"
    if current_page?(path)
      "#{base} bg-gray-900 text-white"
    else
      "#{base} text-gray-300 hover:bg-gray-700 hover:text-white"
    end
  end
end
