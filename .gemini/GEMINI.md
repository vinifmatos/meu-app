# gemini.md — Project Engineering Rules

This file defines the mandatory engineering rules for this repository.

The AI assistant must follow these rules when generating or modifying code.

If any instruction conflicts with these rules, ask the user before proceeding.

---

# Core Principles

Always prioritize:

1. Consistency with the existing codebase
2. Simplicity over cleverness
3. Readability over brevity
4. Maintainability over premature optimization
5. Explicit code over implicit behavior

Avoid introducing new patterns when the project already has an established solution.

---

# Decision Rules

Before implementing any change:

1. Search the codebase for existing implementations.
2. Reuse existing helpers, services, or utilities whenever possible.
3. Follow the current project architecture.
4. Avoid introducing new frameworks, libraries, or abstractions.
5. If unsure about architecture decisions, ask the user.

---

# Safe Change Rules

When modifying existing code:

- NEVER remove existing functionality unless explicitly instructed.
- NEVER rename public APIs without confirmation.
- NEVER change database schema without user approval.
- NEVER remove tests unless replacing them with better ones.
- NEVER change authentication or authorization logic without approval.
- Prefer additive changes instead of destructive changes.

---

# Git Workflow

Always create a branch before starting work.

Branch naming:

feature/nome-da-feature  
fix/nome-do-bug  
refactor/nome-da-refatoracao  
chore/nome-da-tarefa

Pull requests must be created using:

gh pr create --fill

---

# Communication

User interactions should preferably be in Brazilian Portuguese.

Code comments should be written in English.

---

# Documentation

Documentation must be updated whenever:

- new feature is added
- API behavior changes
- architecture changes
- business logic is introduced

Documentation location:

docs/

---

# Backend — Ruby on Rails API

The backend is a Rails API-only application.

config.api_only = true

Focus on:

- scalability
- performance
- maintainability

---

# Backend Architecture

Preferred architecture:

app/controllers  
app/models  
app/services  
app/queries  
app/jobs  
app/views

Responsibilities:

Controllers  
→ HTTP layer

Models  
→ domain logic

Services  
→ business workflows

Query Objects  
→ complex database queries

Jobs  
→ background tasks

---

# Controllers

Controllers must remain thin.

Controllers are responsible for:

- authentication
- authorization
- request validation
- calling services
- rendering responses

Controllers must NOT contain:

- business logic
- complex queries
- heavy data transformations

---

# JSON Response Standard

ALL controllers MUST use `JsonResponseHelper`.

Successful responses must use:

render_json_success(template: :index, locals: { users: @users })

Error responses must use:

render_json_error(message: "Error message", status: :bad_request)

The API response format MUST follow:

{
  "status": HTTP status code,
  "data": object or array,
  "pagination": object (optional),
  "message": "Optional descriptive message"
}

---

# Jbuilder Rendering Rules

All Jbuilder views MUST be implemented as partials.

Controllers MUST NOT render full Jbuilder views such as:

show.json.jbuilder
index.json.jbuilder

Instead, always create partials using the underscore convention:

_show.json.jbuilder
_index.json.jbuilder
_user.json.jbuilder

The `JsonResponseHelper` wraps the rendered partial inside the `data` attribute of the API response.

Therefore, controller responses must always use:

render_json_success(template: :show, locals: { user: @user })

---

# Error Handling

Use centralized error handling in:

ApplicationController

Use:

rescue_from

Examples:

ActiveRecord::RecordNotFound  
ActiveRecord::RecordInvalid

Error responses must also follow the standard JSON structure.

---

# Database Rules

Prefer:

- ActiveRecord associations
- scopes
- query objects

Avoid:

- SQL inside controllers
- complex logic in migrations

Migrations must be:

- reversible
- small
- safe for production

---

# Performance Rules

Avoid common performance problems.

Always consider:

N+1 queries

Use:

includes  
preload  
eager_load

Large datasets

Use:

find_each  
in_batches

Heavy computations

Move to background jobs.

---

# Background Jobs

Use:

SolidQueue

For:

- emails
- large processing
- external integrations
- reports

Never block HTTP requests with long tasks.

---

# Security Rules

Never trust client input.

Always:

- validate parameters
- use strong parameters
- sanitize inputs

Never expose:

- internal IDs unnecessarily
- sensitive attributes
- stack traces

Use:

JWT  
authorization policies

when needed.

---

# Ruby Best Practices

Prefer:

each  
map  
select

over:

for

Use guard clauses:

return unless condition

Prefer keyword arguments:

def create_user(name:, email:)

Avoid long methods.

---

# Rubocop

After editing Ruby files run:

bundle exec rubocop -A

---

# Testing (RSpec)

Testing is mandatory.

---

# Test Database

Tests must run using:

RAILS_ENV=test

---

# Test Isolation

The test database must be clean before each test execution.

Never rely on:

- seeds
- pre-existing data

---

# TDD

Follow Test Driven Development.

Workflow:

1 Write tests  
2 Run tests (fail)  
3 Implement feature  
4 Run tests (pass)

---

# Testing Best Practices

Prefer Request Specs over Controller Specs.

Test:

- API responses
- status codes
- business rules

---

# FactoryBot

Factories must:

- exist for every model
- use sequences for unique fields
- use traits for variations

Prefer:

build

over:

create

when possible.

---

# Faker

Use Faker to generate realistic test data.

---

# Frontend — Angular

Frontend uses:

- Angular
- TypeScript
- PrimeNG
- TailwindCSS

Focus on:

- maintainability
- performance
- clean architecture

---

# Package Manager

Always use Yarn.

yarn install  
yarn add  
yarn remove

Never use npm.

---

# Frontend Architecture

Structure:

src/app/core  
src/app/features  
src/app/shared

core

- services
- interceptors
- guards
- global interfaces

features

- domain modules

shared

- reusable UI components

---

# Import Rules

Always use path aliases.

Correct:

@core/services/api.service

Avoid:

../../../../services

---

# Angular Best Practices

Use:

- standalone components
- signals
- lazy loading

Prefer:

input()  
output()  
computed()  
signal()

Avoid:

ngClass  
ngStyle  
HostBinding  
HostListener

Use host property instead.

---

# Component Rules

Components must be:

- small
- focused
- reusable

Always use:

ChangeDetectionStrategy.OnPush

Prefer Reactive Forms.

---

# Templates

Prefer new Angular control flow:

@if  
@for  
@switch

Avoid:

*ngIf  
*ngFor

Templates must not contain complex logic.

---

# State Management

Use signals for component state.

Prefer:

set()  
update()  
computed()

Avoid mutable state.

---

# HTTP Communication

All backend communication must go through:

@core/servicos/api.service

Never use HttpClient directly.

This ensures:

- base URL
- headers
- authentication
- response standardization

---

# Styling

Use:

- TailwindCSS
- PrimeNG components

Use semantic surface classes:

bg-surface  
text-surface  
border-surface

Do not manually implement dark mode overrides.

---

# Images

Use:

NgOptimizedImage

Except for inline base64 images.

---

# Performance Rules (Frontend)

Avoid:

- unnecessary change detection
- large components
- duplicated logic

Use:

trackBy  
OnPush  
lazy routes

---

# Code Quality Checklist

Before finishing any task verify:

- code follows project architecture
- naming conventions respected
- no unused imports
- no duplicated logic
- tests exist or were updated
- documentation updated if necessary
- code is readable and maintainable

Prefer simple solutions over complex abstractions.

---

# Forbidden Practices

The following practices are not allowed.

Backend:

- business logic in controllers
- raw SQL inside controllers
- skipping validations
- large monolithic services

Frontend:

- direct HttpClient usage
- complex logic in templates
- deep relative imports
- massive components (>500 lines)

---

# Final Rule

If uncertain about any implementation detail:

Ask the user before making architectural decisions.
