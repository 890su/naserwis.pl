import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  workers: 2,
  retries: 0,
  reporter: 'list',
  outputDir: 'outputs/test-results',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:8846', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true, trace: 'retain-on-failure' },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: 'node scripts/serve-test.mjs', url: 'http://127.0.0.1:8846', reuseExistingServer: !process.env.CI }
});
