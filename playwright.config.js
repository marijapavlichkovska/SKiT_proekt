import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/playwright',
    timeout: 30000,
    retries: 0,
    reporter: [ ['list'], ['html', { outputFolder: 'playwright-report' }] ],
    use: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 5000,
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
});

