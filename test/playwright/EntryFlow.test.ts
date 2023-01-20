import { expect, test } from "../playwright-lib/baseFixtures";
import {
  startErrorWatch,
  stopErrorWatch,
  waitInitialSceneLoad
} from "../playwright-lib/TestCommon";

test('entry flow', async ({ page }) => {
  test.setTimeout(240000);
  // Go to https://alphahub.aptero.co/EVa7SjZ/playwright-test-1
  await page.goto('hub.html?hub_id=EVa7SjZ');

  await startErrorWatch(page);
  await page.context().grantPermissions(['camera', 'microphone']);
  await waitInitialSceneLoad(page);

  // Click text=Accept
  await page.locator('text=Accept').click();

  // Click text=Volume OffClick to Test Audio
  await page.locator('text=Volume OffClick to Test Audio').click();

  // Click text=Enter Room
  await page.locator('text=Enter Room').click();

  // Click text=Enter Room Anyway
  page.locator('text=Enter Room Anyway').click().catch(e => {
    /*optional*/
  })

  await new Promise(resolve => setTimeout(resolve,2000));
  await stopErrorWatch(page);
  //await page.screenshot({ path: './coverage/store/entry-flow.png' });
  if(process.env.PWDEBUG) {
    await page.pause();
  }
});
