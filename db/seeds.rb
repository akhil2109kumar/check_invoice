# db/seeds.rb

companies = [
  "Tech Solutions",
  "Global Innovations",
  "NextGen Systems",
  "Alpha Enterprises",
  "Future Vision Ltd."
]

companies.each do |company_name|
  Company.find_or_create_by(name: company_name)
end
