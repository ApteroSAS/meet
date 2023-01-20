// playwright.config.js
// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
// @ts-check
//https://playwright.dev/docs/test-configuration#global-configuration
// https://playwright.dev/docs/api/class-testoptions

const config = {
    testDir:process.env.PW_TEST_DIR || "./playwright-teams",
    webServer: {
        ignoreHTTPSErrors: true,
        command: 'yarn run ci:coverage:serve',
        url: 'https://localhost:'+(process.env.PW_PORT||"53000"),
        reuseExistingServer: !!process.env.CI,
        timeout: 120 * 1000
    },
    expect: {
        timeout: 2*60*1000,
    },
    use: {
        screenshot: 'only-on-failure',
        ignoreHTTPSErrors: true,
        baseURL: 'https://localhost:'+(process.env.PW_PORT||"53000"),
    }
};
module.exports = config;