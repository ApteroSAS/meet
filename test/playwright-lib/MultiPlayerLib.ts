import { test } from "./baseFixtures";
import {
  startErrorWatch,
  stopErrorWatch,
  waitInitialSceneLoad,
} from "./TestCommon";

export async function runMultiplayer(playersNumber,page,url){
  test.setTimeout((playersNumber*60*1000)+4*60*1000);
  const context = page.context();

  await page.goto(url);
  await startErrorWatch(page);
  await waitInitialSceneLoad(page);
  await page.context().grantPermissions(['camera', 'microphone']);

  // Click text=MoreMore
  await page.locator('text=MoreMore').click();
  // Click text=SettingsPreferences
  await page.locator('text=SettingsPreferences').click();
  // Click text=Misc
  await page.locator('text=Misc').click();
  await (await (await (await page.locator('text=Disable auto-exit when multiple hubs instances are open')).locator('xpath=..')).locator("input")).click();
  await (await (await (await page.locator('text=Disable auto-exit when idle or backgrounded')).locator('xpath=..')).locator("input")).click();
  //await page.locator('div:nth-child(10) .preferences-screen__row__24y1Q input').click();
  //await page.locator('div:nth-child(11) .preferences-screen__row__24y1Q input').check();
  // Click [aria-label="Close Preferences Menu"]
  await page.locator('[aria-label="Close Preferences Menu"]').click();
  await stopErrorWatch(page);

  //Start network test
  for (let i = 0; i < playersNumber-1; i++) {
    await context.newPage();
  }
  const allPages = context.pages();
  for (const page of allPages) {
    //https://alphahub.aptero.co/bxmhkMb/playwright-network
    await page.goto(url);
    await startErrorWatch(page);
    await waitInitialSceneLoad(page);
    await stopErrorWatch(page);
  }
  await new Promise(resolve => setTimeout(resolve,2000));
}