import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list'], ['github']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  expect: { timeout: 5_000 },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'setup', testDir: './e2e', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.storage/user.json',
      },
      dependencies: ['setup'],
      testIgnore: [/specs\/auth\//, /specs\/admin\//],
    },
    {
      name: 'chromium-anon',
      use: {
        ...devices['Desktop Chrome'],
        storageState: {
          cookies: [{
            name: 'NEXT_LOCALE', value: 'en', domain: 'localhost', path: '/',
            expires: -1, httpOnly: false, secure: false, sameSite: 'Lax',
          }],
          origins: [],
        },
      },
      testMatch: /specs\/auth\//,
    },
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.storage/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /specs\/admin\//,
    },
  ],
});
