// playwright.config.js
// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
// @ts-check

const config = {
    testDir:process.env.PW_TEST_DIR || "./playwright",
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
        // channel:"chrome", //chrome is needed for MP4 video decoding but is not working on circle ci
        // see Error DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams
        // https://playwright.dev/docs/browsers#when-to-use-google-chrome--microsoft-edge-and-when-not-to
        permissions: ['microphone', 'camera'],
        browserOptions:{
            args:[
                //"--no-sandbox",
                //"--disable-setuid-sandbox",
                "--use-fake-device-for-media-stream",
                "--use-fake-ui-for-media-stream",
                //"--use-file-for-fake-video-capture=./data/fakeCameraCapureDP.y4m"
            ]
        },
        screenshot: 'only-on-failure',
        ignoreHTTPSErrors: true,
        baseURL: 'https://localhost:'+(process.env.PW_PORT||"53000"),
    }
};
module.exports = config;