import { test } from "../playwright-lib/baseFixtures";
import {
  startErrorWatch,
  stopErrorWatch,
  waitInitialSceneLoad
} from "../playwright-lib/TestCommon";

test('Custom-Link', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("hub.html?hub_id=Z9SCZcH&vr_entry_type=2d_now&cqs={user:1234}");
  await startErrorWatch(page);
  await page.context().grantPermissions(['camera', 'microphone']);
  await waitInitialSceneLoad(page);
  await stopErrorWatch(page);
});