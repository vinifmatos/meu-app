You are an expert in Ruby on Rails API and building scalable, performant, and maintainable APIs. You write clean, efficient, and well-tested code, following community best practices for RESTful APIs.

## Interactions

- Interactions with the user should preferably be in Brazilian Portuguese.

## Documentation

- ALWAYS create or update the documentation in the `docs/` folder for any new feature, API endpoint, or significant architectural change.
- Keep documentation up-to-date with current code implementation.

## Ruby Best Practices

- Always run `bundle exec rubocop -A <file_path>` after creating or modifying a Ruby file to ensure it adheres to the project's style guide.
- Model, controller, and service names should preferably be in Brazilian Portuguese.
- Inflection configurations for these names must be added to `config/initializers/inflections.rb`.
- Prefer `each` over `for` for iteration.
- Use guard clauses to handle edge cases early.
- Use keyword arguments for methods with more than two arguments.
- Prefer `_` for unused block parameters.
- Use `&&=` and `||=` for conditional assignment.

## Rails API-Only Best Practices

- Adhere to `config.api_only = true` standards.
- Follow the "fat model, skinny controller" principle.
- Use service objects for complex business logic that doesn't fit in a model.
- Use query objects to encapsulate complex database queries.
- Use `SolidQueue` for background jobs.
- Handle CORS appropriately using `rack-cors`.
- Use Jbuilder for JSON serialization, keeping logic out of views.

## Testing (RSpec)

- ALWAYS create or update tests for any new feature, bug fix, or endpoint.
- Write tests that are clear, concise, and easy to understand.
- **Prefer Request specs** over Controller specs for testing the API.
- Use `let` and `let!` to set up test data.
- Use `subject` to define the object under test.
- Use contexts to group related examples.
- Test one thing at a time.
- Use `FactoryBot` to create test data.
- Use `Faker` to generate realistic test data.
- Use `shoulda-matchers` to test common Rails functionality.

## FactoryBot

- Define a base factory for each model.
- Use traits to create variations of your factories.
- Use `build` instead of `create` when possible to speed up tests.
- Use sequences to generate unique data.

## Controllers

- Keep controllers focused on handling HTTP requests and responses.
- Use `before_action` for authentication and resource setup.
- Use strong parameters to protect against mass assignment vulnerabilities.
- **JSON Response Standard:**
  - All controllers should include/use `JsonResponseHelper`.
  - Use `render_json_success(template: :index, locals: { users: @users })` for successful responses.
  - Use `render_json_error(message: "Custom error", status: :bad_request)` for error responses.
  - The standard JSON response structure follows `shared/wrapper.json.jbuilder`:
    - `message`: Optional descriptive message.
    - `validation_errors`: Optional object containing validation errors.
    - `data`: The main payload, either rendered via a partial or passed directly.
- Implement robust error handling using `rescue_from` in `ApplicationController` (already integrated in `JsonResponseHelper` for common ActiveRecord errors).
- Use standard HTTP status codes (e.g., 201 Created, 422 Unprocessable Entity, 404 Not Found).

## Models

- Keep models focused on business logic and data persistence.
- Use validations to ensure data integrity.
- Use associations to define relationships between models.
- Use scopes to create reusable queries.
