const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_PORT = process.env.FRONTEND_PORT || process.env.PORT || 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 3030;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `concurrently \"PORT=${FRONTEND_PORT} npm run start:frontend\" \"PORT=${BACKEND_PORT} npm run start:backend\"`,
    port: FRONTEND_PORT,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
