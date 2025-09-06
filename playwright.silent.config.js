import { defineConfig, devices } from '@playwright/test';

/**
 * Silent testing configuration
 * This configuration runs tests completely in the background without any browser windows
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for faster feedback
  workers: 1, // Single worker to avoid conflicts
  reporter: [
    ['list'], // Simple list reporter
    ['json', { outputFile: 'test-results/silent-results.json' }]
  ],
  /* Global test timeout */
  timeout: 15 * 1000, // 15 seconds per test (shorter for faster feedback)
  /* Global expect timeout */
  expect: {
    timeout: 5 * 1000, // 5 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off', // No tracing for speed
    screenshot: 'off', // No screenshots for speed
    video: 'off', // No videos for speed
    // Force headless mode
    headless: true,
    /* Navigation timeout */
    navigationTimeout: 10 * 1000, // 10 seconds for page navigation
    /* Action timeout */
    actionTimeout: 5 * 1000, // 5 seconds for actions
  },

  projects: [
    {
      name: 'webkit-silent',
      use: { 
        ...devices['Desktop Safari'],
        headless: true,
        // Additional silent settings
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000, // 30 seconds to start the dev server
    stdout: 'pipe', // Hide server output
    stderr: 'pipe', // Hide server errors
  },
});
