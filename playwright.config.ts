import { defineConfig, devices } from '@playwright/test';
import { findChromium } from './scripts/static-server';

/**
 * E2E runs against the built static export on a local static server, not
 * `next dev` — the point is to test what actually ships.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: findChromium() },
      },
    },
  ],
  webServer: {
    command: 'pnpm tsx scripts/serve.ts 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
  },
});
