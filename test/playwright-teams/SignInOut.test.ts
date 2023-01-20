//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import {
    stopErrorWatchTeams,
    initialConnexion,
    notifyErrorInFrame, startErrorWatchTeams,
    treatConsoleErrorAsErrorInFrame,
    waitInitialSceneLoadIframe, navigateToTab
} from "../playwright-lib/TeamsTest";

/**
 * Sign in sign out in tab
 */
test('static tab', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    await navigateToTab(page,"Static");
    await waitInitialSceneLoadIframe(page);

    //sign in
    // Click [aria-label="More"]
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('[aria-label="More"]').click();
    // Click text=EnterSign In
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('text=Sign In').click();
    // Click text=Sign in with teams
    try {
        await page.waitForEvent('popup',{timeout:2000});
    }catch (e) {
        //ignore timeout error
    }

    //SignOut

    // Click [aria-label="More"]
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('[aria-label="More"]').click();
    // Click text=LeaveSign Out
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('text=Sign Out').click();

    await stopErrorWatchTeams(page);
})

