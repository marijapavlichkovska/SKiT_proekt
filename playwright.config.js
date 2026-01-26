import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/playwright',  // Path to all your Playwright tests
    timeout: 30000,                  // 30 seconds per test
    retries: 0,                       // Change to 1-2 for flaky tests
    reporter: [ ['list'], ['html', { outputFolder: 'playwright-report' }] ],
    use: {
        headless: false,               // Run in visible browser for debugging
        viewport: { width: 1280, height: 720 },
        actionTimeout: 5000,
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
});
