# Requirements

- **Ruby Version:** 3.4.1
- **Database:** PostgreSQL

## Setup & Installation

### Clone the Repository
```sh
git clone https://github.com/akhil2109kumar/check_invoice.git
cd check_invoice
```

### Install Dependencies
```sh
bundle install
rails assets:precompile
```

## Database Setup

### Create & Migrate Database
```sh
rails db:create
rails db:migrate
```

### Seed Initial Data
```sh
rails db:seed
```

## Running the Application

### Start the Rails server
```sh
rails server
```

## Running Tests

To run the test suite, execute:
```sh
bundle exec rspec
```
