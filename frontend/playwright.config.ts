import { defineConfig, devices } from '@playwright/test';

// Assumes both the backend (http://localhost:4000, pointed at a disposable
// test database) and this frontend's dev server are already running — see
// e2e/README.md. Deliberately no `webServer` auto-start here: the backend
// needs env vars (DATABASE_URL etc.) this config has no way to supply, so
// managing only the frontend half would be a half-solution that's easy to
// mistake for the whole thing.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // tests share seeded accounts/data; parallel runs would race each other
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
