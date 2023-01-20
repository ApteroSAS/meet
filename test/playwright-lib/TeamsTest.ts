//import localJson from './../../.fx/states/state.local.json';
//export const localTeamsAppId = localJson["fx-resource-appstudio"].teamsAppId;
export const localTeamsAppId = "b5fd758c-0623-4e51-ab03-a5898b9d0f0b";
export const tenant = "48caed5d-d20d-40ce-b0cd-9261fc5d8f83";
export const accountHint = "test1@aptero.co";
export const password = "Lub09002";


//See TeamsTestHelper for sther side
//import {ERROR_LOG_NOTIFICATION} from "../../src/aptero/module/microsoft/service/TeamsTestHelper";
export async function navigateToTab(page,tabName = "Virtual Meeting"){
    // Click [aria-label="Teams Toolbar"]
    await page.locator('[aria-label="Teams Toolbar"]').click();
    // Click [aria-label="Your teams"] ng-include div:has-text("General")
    await page.locator('[aria-label="Your teams"] ng-include div:has-text("General")').click();
    // assert.equal(page3.url(), 'https://teams.microsoft.com/_#/conversations/General?threadId=19:LsdNx7OQvs6oxFE2Ro5hLOMTC1lHYmaE_Ee-Kpr_6PI1@thread.tacv2&ctx=channel');
    // Click text=Virtual Meeting (5)
    await page.locator('text='+tabName).click();
    // assert.equal(page3.url(), 'https://teams.microsoft.com/_#/tab::3f6f4050-ae56-40d2-9a8a-6e4f143ddf42/General?threadId=19:LsdNx7OQvs6oxFE2Ro5hLOMTC1lHYmaE_Ee-Kpr_6PI1@thread.tacv2&ctx=channel');
}

/*let browser = null;
async function init(page){
    await page.close();
    if(browser){
        await browser.close();
    }
    browser = await chromium.launchPersistentContext("./coverage/chrometmp",{
        args:["--disable-web-security","--disable-site-isolation-for-policy"],
    });
    page = await browser.newPage();
    return page;
}

async function finalize(){

    // other actions...
    await browser.close();
}*/

export function treatConsoleWarnAsErrorInFrame(page) {
    page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve): window.onCancelPlayWrightEvaluate = [resolve];
            //let contentWindow = document.getElementsByName("embedded-page-container")[0].contentWindow;
            //const oldWarn = contentWindow.console.warn;
            //Uncaught DOMException: Blocked a frame with origin "https://teams.microsoft.com" from accessing a cross-origin frame.
            window.addEventListener("message", event => {
                if (event.data) {
                    let message = JSON.parse(event.data);
                    const WARN_LOG_NOTIFICATION = "WARN_LOG_NOTIFICATION";
                    if (message.type === WARN_LOG_NOTIFICATION) {
                        reject("playwright iframe console warn reporter");
                    }
                }
            });
        });
    }).catch(async e => {
        if(process.env.PWDEBUG) {
            await page.pause();
        }
        throw new Error(e);
    });
}

export function treatConsoleErrorAsErrorInFrame(page) {
    page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve): window.onCancelPlayWrightEvaluate = [resolve];
            window.addEventListener("message", event => {
                if (event.data) {
                    let message = JSON.parse(event.data);
                    const ERROR_LOG_NOTIFICATION = "ERROR_LOG_NOTIFICATION";
                    if (message.type === ERROR_LOG_NOTIFICATION) {
                        reject("playwright iframe console error reporter");
                    }
                }
            });
        });
    }).catch(async e => {
        if(process.env.PWDEBUG) {
            await page.pause();
        }
        throw new Error(e);
    });
}

export function notifyErrorInFrame(page) {
    page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve): window.onCancelPlayWrightEvaluate = [resolve];
            window.addEventListener("message", event => {
                if (event.data) {
                    let message = JSON.parse(event.data);
                    const THROW_NOTIFICATION = "THROW_NOTIFICATION";
                    if (message.type === THROW_NOTIFICATION) {
                        reject("playwright iframe error reporter");
                    }
                }
            });
        });
    }).catch(async e => {
        if(process.env.PWDEBUG) {
            await page.pause();
        }
        throw new Error(e);
    });
}

export async function stopErrorWatchTeams(page){
    await page.evaluate(async () => {
        // @ts-ignore
        for(const cancel of window.onCancelPlayWrightEvaluate){
            cancel();
        }
    });
    if(process.env.PWDEBUG) {
        await page.pause();
    }
}

export function startErrorWatchTeams(page){
    //treatConsoleWarnAsErrorInFrame //to improve quality
    treatConsoleErrorAsErrorInFrame(page);
    notifyErrorInFrame(page);
}

export async function waitInitialSceneLoadIframe(page) {
    await page.evaluate(async () => {
        await new Promise(resolve => {
            window.addEventListener("message", event => {
                if (event.data) {
                    let message = JSON.parse(event.data);
                    if (message.type === 'apt:room:entered') {
                        resolve(true);
                    }
                }
            });
        });
    });
    await new Promise(resolve => setTimeout(resolve, 5000));//TODO find a better event
}

export async function initialConnexion(page, withHint = false) {
    if (!withHint) {
        // Click [placeholder="Email\, phone\, or Skype"]
        await page.locator('[placeholder="Email\\, phone\\, or Skype"]').click();
        // Fill [placeholder="Email\, phone\, or Skype"]
        await page.locator('[placeholder="Email\\, phone\\, or Skype"]').fill(accountHint);
        // Click text=Next
        await Promise.all([
            page.waitForNavigation(/*{ url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=id_token&scope=openid%20profile&client_id=5e3ce6c0-2b1f-4285-8d4b-75ee78787346&redirect_uri=https%3A%2F%2Fteams.microsoft.com%2Fgo&state=eyJpZCI6ImI0NjE5Yzg4LTlkNjktNDBkNS1iNmEwLTVkZDRlMWE5N2Q0MSIsInRzIjoxNjUyNzE2OTc0LCJtZXRob2QiOiJyZWRpcmVjdEludGVyYWN0aW9uIn0%3D&nonce=8ef48112-074b-4cf8-8d1e-e0d28f723b7c&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=1.3.4&client-request-id=946004bb-b9d0-487e-b24a-3c9b80fe9756&response_mode=fragment&sso_reload=true' }*/),
            page.locator('text=Next').click()
        ]);
    }
    // Click [placeholder="Password"]
    await page.locator('[placeholder="Password"]').click();
    // Fill [placeholder="Password"]
    await page.locator('[placeholder="Password"]').fill(password);
    // Click text=Sign in
    await Promise.all([
        page.waitForNavigation(/*{ url: 'https://login.microsoftonline.com/common/login' }*/),
        // Click input:has-text("Sign in")
        page.locator('input:has-text("Sign in")').click()
    ]);
    // Check [aria-label="Don\'t show this again"]
    await page.locator('[aria-label="Don\\\'t show this again"]').check();
    // Click text=Yes
    await Promise.all([
        page.waitForNavigation(/*{ url: 'https://teams.microsoft.com/_' }*/),
        page.locator('text=Yes').click()
    ]);
    await page.waitForNavigation(/*{ url: 'https://teams.microsoft.com/_' }*/)
    //only if page is headed it seems
    // Click [aria-label="Dismiss"]
    const dismissLocator = page.locator('[aria-label="Dismiss"]').click().catch(e=>{
        /* ignore since this is an optional click*/
    })
}