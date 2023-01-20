import { test } from "../playwright-lib/baseFixtures";
import {
  startErrorWatch,
  stopErrorWatch,
  waitInitialSceneLoad
} from "../playwright-lib/TestCommon";

test('playwright-test-1 html', async ({ page }) => {
  test.setTimeout(120000);
  //https://alphahub.aptero.co/EVa7SjZ/playwright-test-1
  await page.goto('hub.html?hub_id=EVa7SjZ&vr_entry_type=2d_now');
  await startErrorWatch(page);
  await page.context().grantPermissions(['camera', 'microphone']);
  await waitInitialSceneLoad(page);
  //await page.screenshot({ path: './coverage/store/playwright-test-1.png' });
  await stopErrorWatch(page);
});

test('playwright-test-2 html', async ({ page }) => {
  test.setTimeout(120000);
  //https://alphahub.aptero.co/y3UKjjo/playwright-test-2
  await page.goto('hub.html?hub_id=y3UKjjo&vr_entry_type=2d_now');
  await startErrorWatch(page);
  await page.context().grantPermissions(['camera', 'microphone']);
  await waitInitialSceneLoad(page);
  //await page.screenshot({ path: './coverage/store/playwright-test-2.png' });
  await stopErrorWatch(page);
});