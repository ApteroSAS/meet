// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createWorld, Entity, LazyEntity, registerLocalModule} from "@aptero/axolotis-player";

//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import {
    accountHint,
    initialConnexion,
    localTeamsAppId,
    navigateToTab,
    startErrorWatchTeams, stopErrorWatchTeams,
    tenant, waitInitialSceneLoadIframe
} from "../playwright-lib/TeamsTest";

/**
 * Remove Tab
 */
test('teams initial cleanup (no fail)', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    // Click [aria-label="Teams Toolbar"]
    await page.locator('[aria-label="Teams Toolbar"]').click();
    // Click [aria-label="Your teams"] ng-include div:has-text("General")
    await page.locator('[aria-label="Your teams"] ng-include div:has-text("General")').first().click();
    await page.locator('[aria-label="Files"] >> text=Files').click();//to avoid having all the chat log

    try {
        const locator = page.locator('button[role="tab"]:has-text("more")');
        await locator.waitFor({ state: 'visible',timeout:5000 });
        if(await locator.count()>0) {
            await locator.click();
        }
    }catch (e){
        // optional ignore
    }


    // Click text=PostsFilesWikiVirtual Meeting >> svg[role="presentation"] >> nth=2
    const locator = page.locator('text=Virtual Meeting').first();
    try {
        await locator.waitFor({ state: 'visible',timeout:5000 });
    }catch (e){
        // optional ignore
    }
    if(await locator.count()>0) {
        await page.locator('text=Virtual Meeting').first().click();
        await page.locator('text=Virtual Meeting').first().click();
        // Click button:has-text("Remove")
        await page.locator('button:has-text("Remove")').click();
        // Click button:has-text("Remove")
        await page.locator('button:has-text("Remove")').click();
        await locator.waitFor({state:'detached',timeout:5000});
    }
});

/**
 * Create a tab
 */
test('teams setting up', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    //Navigate to toolbar
    // Click [aria-label="Teams Toolbar"]
    await page.locator('[aria-label="Teams Toolbar"]').click();
    // Click [aria-label="Your teams"] ng-include div:has-text("General")
    await page.locator('[aria-label="Your teams"] ng-include div:has-text("General")').first().click();
    //await page.locator('[aria-label="Files"] >> text=Files').click();//to avoid having all the chat log

    //Add the app
    // Click #add-tab-button-v2
    await page.locator('#add-tab-button-v2').click();
    // Click text=Add a tab Turn your favorite apps and files into tabs at the top of the channel  >> [placeholder="Search"]
    await page.locator('text=Add a tab Turn your favorite apps and files into tabs at the top of the channel  >> [placeholder="Search"]').click();
    // Fill text=Add a tab Turn your favorite apps and files into tabs at the top of the channel  >> [placeholder="Search"]
    await page.locator('text=Add a tab Turn your favorite apps and files into tabs at the top of the channel  >> [placeholder="Search"]').fill('aptero');

    await new Promise(resolve => setTimeout(resolve, 500));
    // Click text=Aptero (CI)
    await page.locator('text=Aptero (CI)').first().click();

    // Click text=Post to the channel about this tab Back Save >> path >> nth=1
    await page.locator('text=Post to the channel about this tab Back Save >> path').nth(1).click();

    //https://playwright.dev/docs/api/class-framelocator

    //const frame = page.frameLocator('iframe[name="embedded-page-container"]')
    const frame = page.frameLocator('iframe[name="embedded-page-container"]');

    // Click button:has-text("Sign In")
    //NOTE auto sign in is activated
    // await frame.locator('button:has-text("Sign In")').click();

    // Click text=My Room
    await frame.locator('text=My Room').click();
    // Click text=StarPeople 0Playwright - EmptyJoined 3 minutes ago
    await frame.locator('img[alt="Playwright - Empty"]').click();

    await new Promise(resolve => setTimeout(resolve, 500));
    await page.locator('[aria-label="Save"]').click();

    await page.waitForLoadState('networkidle');//load the iframe containing the aptero app
    await new Promise(resolve => setTimeout(resolve, 500));
    //Focus virtual meeting
    // Click text=Virtual Meeting
    await page.locator('text=Virtual Meeting').click();
    // Click text=Virtual Meeting
    await page.locator('text=Virtual Meeting').click();
    await page.waitForLoadState('networkidle');

    // Click [aria-label="More"]
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('[aria-label="More"]').click();

    await stopErrorWatchTeams(page);

});

/**
 * Sign in sign out in tab
 */
test('navigate to tab', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    await navigateToTab(page);
    await waitInitialSceneLoadIframe(page);
    await stopErrorWatchTeams(page);
})

/**
 * Remove Tab
 */
test('teams cleanup', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    // Click [aria-label="Teams Toolbar"]
    await page.locator('[aria-label="Teams Toolbar"]').click();
    // Click [aria-label="Your teams"] ng-include div:has-text("General")
    await page.locator('[aria-label="Your teams"] ng-include div:has-text("General")').first().click();
    await page.locator('[aria-label="Files"] >> text=Files').click();//to avoid having all the chat log

    try {
        const locator = page.locator('button[role="tab"]:has-text("more")');
        await locator.waitFor({ state: 'visible',timeout:5000 });
        if(await locator.count()>0) {
            await locator.click();
        }
    }catch (e){
        /* optional ignore*/
    }

    // Click text=PostsFilesWikiVirtual Meeting >> svg[role="presentation"] >> nth=2
    await page.locator('text=Virtual Meeting').first().click();
    await page.locator('text=Virtual Meeting').first().click();
    // Click button:has-text("Remove")
    await page.locator('button:has-text("Remove")').click();
    // Click button:has-text("Remove")
    await page.locator('button:has-text("Remove")').click();
    await page.locator('[aria-label="Virtual Meeting Press Enter to select or press Shift\+F10 for more options"] >> text=Virtual Meeting').waitFor({state:'detached',timeout:5000});
    await stopErrorWatchTeams(page);
});


