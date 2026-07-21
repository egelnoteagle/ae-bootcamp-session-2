# Testing Guidelines

These testing principles define the required standards for this project.

## Unit Tests

- **Framework**: Use Jest to test individual functions and React components in isolation.
- **Naming convention**: Unit tests should use `*.test.js` or `*.test.ts`.
- **Backend location**: Place backend unit tests in `packages/backend/__tests__/`.
- **Frontend location**: Place frontend unit tests in `packages/frontend/src/__tests__/`.
- **File naming**: Name unit test files to match what they are testing (for example, `app.test.js` for `app.js`).

## Integration Tests

- **Framework**: Use Jest + Supertest to test backend API endpoints with real HTTP requests.
- **Location**: Place integration tests in `packages/backend/__tests__/integration/`.
- **Naming convention**: Integration tests should use `*.test.js` or `*.test.ts`.
- **File naming**: Name integration test files based on what they test (for example, `todos-api.test.js` for TODO API endpoints).

## End-to-End (E2E) Tests

- **Framework**: Use Playwright (required) to test complete UI workflows through browser automation.
- **Location**: Place E2E tests in `tests/e2e/`.
- **Naming convention**: E2E tests should use `*.spec.js` or `*.spec.ts`.
- **File naming**: Name E2E test files based on the user journey they test (for example, `todo-workflow.spec.js`).
- **Browser policy**: Playwright tests must use one browser only.
- **Architecture**: Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- **Scope limit**: Limit E2E tests to 5-8 critical user journeys; focus on happy paths and key edge cases, not exhaustive coverage.

## Port Configuration

- Always use environment variables with sensible defaults for port configuration.
- Backend:

```js
const PORT = process.env.PORT || 3030;
```

- Frontend: React's default port is 3000, but it can be overridden with the `PORT` environment variable.
- This allows CI/CD workflows to dynamically detect ports.

## Test Isolation and Reliability

- All tests must be isolated and independent. Each test should set up its own data and never rely on other tests.
- Setup and teardown hooks are required so tests succeed on multiple runs.

## Feature Coverage and Maintainability

- All new features should include appropriate tests.
- Tests should be maintainable and follow best practices.
