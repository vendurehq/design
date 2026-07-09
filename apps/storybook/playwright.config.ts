import { defineConfig, devices } from '@playwright/test';

// Visual baselines are captured on Linux (CI) only, see visual/visual.spec.ts and docs/testing.md.
export default defineConfig({
  testDir: './visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
  timeout: 30_000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:6007',
    trace: 'retain-on-failure',
    colorScheme: 'light',
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: {
    command: 'bunx http-server storybook-static --port 6007 --silent',
    url: 'http://127.0.0.1:6007',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
});
