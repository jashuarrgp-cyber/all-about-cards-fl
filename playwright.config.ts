import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    env: {
      ...process.env,
      TEST_ENV: 'true',
      AUTH_SECRET: 'test-secret-value-with-at-least-32-characters',
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://aacfl:aacfl@localhost:5432/aacfl_test?schema=public',
    },
  },
  use: { baseURL: 'http://127.0.0.1:3000', ...devices['Desktop Chrome'] },
});
