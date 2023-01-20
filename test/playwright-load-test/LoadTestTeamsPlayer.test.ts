//https://alphahub.aptero.co/bxmhkMb/playwright-network

import { test } from "../playwright-lib/baseFixtures";
import { runMultiplayer } from "../playwright-lib/MultiPlayerLib";

test('Teams Load test', async ({ page }) => {
  await runMultiplayer(200,page,'hub.html?hub_id=bxmhkMb&msteams=true');
});