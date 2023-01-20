//https://alphahub.aptero.co/bxmhkMb/playwright-network

import { test } from "../playwright-lib/baseFixtures";
import { runMultiplayer } from "../playwright-lib/MultiPlayerLib";

test('Load Test Limit Multi Player', async ({ page }) => {
  await runMultiplayer(50,page,'hub.html?hub_id=bxmhkMb&vr_entry_type=2d_now');
});