# Coding Guidelines

These coding guidelines define how we write, structure, and maintain code across the project. The goal is to keep the codebase readable, consistent, and easy to evolve as features grow.

## Core Principles

Our default approach is to optimize for clarity and maintainability over cleverness. Code should be straightforward to understand by someone new to the project.

- Favor simple, explicit solutions.
- Prefer consistency with existing patterns over introducing new styles without a strong reason.
- Keep functions and components focused on a single responsibility.
- Write code that is easy to test and reason about.

## General Formatting Rules

Formatting should make intent obvious and reduce cognitive load during reviews.

- Use consistent indentation and spacing throughout a file.
- Keep line lengths manageable so code remains readable in side-by-side diffs.
- Use descriptive names for variables, functions, and components.
- Avoid unnecessary comments; when comments are used, they should explain why, not what.
- Remove dead code, outdated TODOs, and commented-out blocks before merging.

## Import Organization

Imports should be organized consistently so dependencies are easy to scan.

- Group imports by category:
  1. External libraries
  2. Internal modules
  3. Relative imports
- Keep imports alphabetized within each group when practical.
- Avoid unused imports.
- Prefer named imports when they improve clarity and discoverability.
- Keep import paths predictable and aligned with project structure.

## Linting and Static Quality Checks

Linting is required and should be treated as a quality gate, not a suggestion.

- Run ESLint regularly during development, not only before commit.
- Resolve lint warnings and errors before opening a pull request.
- Do not disable lint rules unless there is a clear, documented reason.
- If a lint rule is repeatedly problematic, discuss adjusting the shared configuration instead of bypassing it ad hoc.

## DRY and Reuse Best Practices

Apply DRY (Don't Repeat Yourself) to reduce duplication and maintenance cost.

- Extract repeated logic into reusable functions, hooks, or utilities.
- Centralize shared constants and configuration values.
- Reuse UI patterns and components rather than duplicating markup and styling.
- Avoid over-abstraction; extract only when duplication is real and recurring.

## Error Handling and Defensive Coding

Reliable software handles failure cases intentionally.

- Validate inputs at boundaries (API handlers, forms, and service entry points).
- Return clear, actionable error messages.
- Handle async failures explicitly and avoid silent catches.
- Preserve useful context in logs for troubleshooting.

## Maintainability and Review Readiness

Code should be easy to review, test, and extend.

- Keep pull requests focused and scoped to a clear purpose.
- Prefer small, incremental changes over large refactors mixed with feature work.
- Ensure new features include appropriate tests.
- Update related documentation when behavior or conventions change.

## Definition of Done (Code Quality)

Before considering work complete:

- Code is formatted consistently.
- Imports are organized and unused dependencies are removed.
- Lint checks pass.
- Duplication has been reduced where appropriate.
- Tests and documentation are updated to reflect the change.
