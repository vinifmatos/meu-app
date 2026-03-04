# BACKEND

You are an expert in Ruby on Rails API and building scalable, performant, and maintainable APIs. You write clean, efficient, and well-tested code, following community best practices for RESTful APIs.

## Git Workflow

- ALWAYS create a new branch and checkout to it BEFORE starting any changes for a new feature or bug fix.
- Use descriptive branch names (e.g., `feature/nome-da-funcionalidade` or `fix/nome-do-bug`).
- **Pull Requests**: When a feature is complete, use the GitHub CLI (`gh pr create --fill`) to open a Pull Request automatically.

## Interactions

- Interactions with the user should preferably be in Brazilian Portuguese.

## Documentation

- ALWAYS create or update the documentation in the `docs/` folder for any new feature, API endpoint, or significant architectural change.
- Keep documentation up-to-date with current code implementation.

## Ruby Best Practices

- Always run `bundle exec rubocop -A <file_path>` after creating or modifying a Ruby file to ensure it adheres to the project's style guide.
- Model, controller, and service names should **preferably be in Brazilian Portuguese**, but English names are also accepted.
- Inflection configurations for Portuguese names MUST be added to `config/initializers/inflections.rb` **BEFORE** creating or executing any migrations to ensure correct table pluralization.
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

- **Test Database**: ALWAYS use the test database (`RAILS_ENV=test`) for running any tests.
- **Database Cleaning**: The test database MUST be cleared before each test execution to ensure isolation and prevent side effects from previous runs or seeds.
- **TDD (Test-Driven Development)**: ALWAYS follow the TDD methodology. Create or update tests to reflect the desired behavior BEFORE implementing the actual code changes.
- ALWAYS create or update tests for any new feature, bug fix, or endpoint.
- ALWAYS run related tests after any code change to ensure no regressions were introduced.
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
- **JSON Response Standard**: ALL controllers MUST use `JsonResponseHelper`.
- **Data Encapsulation**: ALL successful responses MUST encapsulate the main payload within a `data` key, following the `shared/wrapper.json.jbuilder` pattern. Even for single objects, prefer nesting under a descriptive key (e.g., `{ "data": { "deck": { ... } } }`) to maintain consistency and extensibility.
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


# FRONTEND

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Git Workflow

- ALWAYS create a new branch and checkout to it BEFORE starting any changes for a new feature or bug fix.
- Use descriptive branch names (e.g., `feature/nome-da-funcionalidade` or `fix/nome-do-bug`).
- **Pull Requests**: When a feature is complete, use the GitHub CLI (`gh pr create --fill`) to open a Pull Request automatically.

## Interactions

- Interactions with the user should preferably be in Brazilian Portuguese.

## Architecture & Structure

- **Package Manager**: ALWAYS use **Yarn** for managing dependencies and running scripts in the frontend project.
- **`src/app/core`**: Must contain pages, services, guards, interceptors, and components related to the main application logic and administrative area. Accessible via `@core` alias.
- **`src/app/features`**: Must contain the application's domain features. Each feature should have its own alias (e.g., `@features/cartas`).
- **`src/styles`**: Must contain custom SCSS files.
- **Imports**: ALWAYS use path aliases (e.g., `@core/interfaces/cartas.interface`) instead of long relative paths (e.g., `../../../../core/...`).

## UI & Styling

- Use **PrimeNG v20** components.
- Use **Tailwind CSS** classes for layout and styling.
- Use **tailwindcss-primeui** for PrimeNG and Tailwind integration.
- **Surface Classes**: When using PrimeUI surface classes (e.g., `bg-surface`, `text-surface`, `border-surface`), DO NOT use the `dark:` prefix or any numeric suffix (e.g., avoid `bg-surface-0` or `dark:bg-surface-900`). Use only the base semantic classes which will automatically adapt to light and dark modes.

## Naming Conventions

- Names of components, services, guards, and other Angular resources should **preferably be in Brazilian Portuguese**, but English names are also accepted.
- Use the **Angular naming convention** for files and folders as defined in `angular.json` or the default convention for the project's Angular version (e.g., `folder-name/file-name.component.ts`).

## Documentation

- ALWAYS create or update the documentation in the `docs/` folder for any new feature, API integration, or significant architectural change.
- Keep documentation up-to-date with current code implementation.

## Testing

- **Test Environment**: E2E tests MUST always target a backend instance running in the test environment (`RAILS_ENV=test`).
- **Database Isolation**: The test database MUST be cleared and optionally seeded before running E2E tests to ensure a consistent and predictable starting state.
- **TDD (Test-Driven Development)**: ALWAYS follow the TDD methodology. Create or update E2E tests (Playwright) to reflect the desired behavior BEFORE implementing the actual code changes.
- **Headless Mode**: E2E tests MUST always be executed in headless mode.
- **Test Output**: E2E test results MUST always be displayed in the console as a list.
- **E2E Port**: E2E tests MUST always use port **4242** for the frontend server to avoid conflicts with development environments.
- **Pre-test Verification**: ALWAYS verify the build output (`yarn ng build`) before running E2E tests to ensure the application is in a stable state.
- ALWAYS create E2E tests using **Playwright** for any new feature or critical user flow.
- E2E tests should be located in `frontend/e2e/specs` and follow the `nome.spec.ts` naming convention.
- **Verification**: ALWAYS run the build command (`yarn ng build`) after any code change to ensure there are no compilation or template errors.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- **Default Values**: ALWAYS use the nullish coalescing operator (`??`) instead of logical OR (`||`) for assigning default values to variables that may be `null` or `undefined`, ensuring that falsy values like `0` or `''` are preserved.

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- **Backend Communication**: ALL services that make HTTP requests to the backend MUST use `@core/servicos/api.service` as their base instead of `HttpClient` directly. This ensures consistent handling of base URLs, versions, headers, and request formatting.
