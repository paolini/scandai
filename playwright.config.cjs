const { defineConfig } = require('@playwright/test')
const { environment } = require('./tests/e2e/environment.cjs')
const { baseURL } = environment()

module.exports = defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/*.spec.cjs',
    timeout: 90_000,
    expect: { timeout: 15_000 },
    workers: 1,
    retries: 0,
    forbidOnly: !!process.env.CI,
    reporter: 'list',
    outputDir: 'test-results/e2e',
    use: {
        baseURL,
        browserName: 'chromium',
        channel: process.env.SCANDAI_E2E_BROWSER_CHANNEL || undefined,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'node tests/e2e/start-server.cjs',
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: false,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    },
})
