You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Git Workflow

- ALWAYS create a new branch and checkout to it BEFORE starting any changes for a new feature or bug fix.
- Use descriptive branch names (e.g., `feature/nome-da-funcionalidade` or `fix/nome-do-bug`).

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

- ALWAYS create E2E tests using **Playwright** for any new feature or critical user flow.
- E2E tests should be located in `frontend/e2e/specs` and follow the `nome.spec.ts` naming convention.
- **Verification**: ALWAYS run the build command (`yarn ng build`) after any code change to ensure there are no compilation or template errors.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

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
