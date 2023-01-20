//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import {
    stopErrorWatchTeams,
    initialConnexion,
    startErrorWatchTeams,
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
    await stopErrorWatchTeams(page);
})

