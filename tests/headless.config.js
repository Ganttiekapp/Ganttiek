import { defineConfig, devices } from '@playwright/test';

/**
 * Headless testing configuration
 * This configuration runs tests without opening browser windows
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  /* Global test timeout */
  timeout: 30 * 1000, // 30 seconds per test
  /* Global expect timeout */
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Force headless mode
    headless: true,
    /* Navigation timeout */
    navigationTimeout: 15 * 1000, // 15 seconds for page navigation
    /* Action timeout */
    actionTimeout: 10 * 1000, // 10 seconds for actions like click, fill, etc.
  },

  projects: [
    {
      name: 'webkit-headless',
      use: { 
        ...devices['Desktop Safari'],
        headless: true,
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000, // 60 seconds to start the dev server
  },
});
