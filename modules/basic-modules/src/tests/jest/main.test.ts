/**
 * @jest-environment jsdom
 */

import {createWorld, getGlobalStorageValue, GLOBAL_WORLDS_ENTITY, WorldEntity} from "@aptero/axolotis-player";
import {cookiesStore, nameGenerationService, phoenixAuth, propertyService, roomService, store} from "../../lib";

async function initAxolotisPlayer(){
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if ((worlds && worlds.length > 0)) {
    throw new Error("Axolotis World already initialized");
  }
  await createWorld();
  const {register} = await import("../../lib/index");
  await register();
  console.log("Axolotis player : loaded");
}

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

test('init',async ()=>{
    await initAxolotisPlayer();
    await store();
    await cookiesStore();
    await phoenixAuth();
    await nameGenerationService();
    await roomService();
    await propertyService();

    (await nameGenerationService()).generateHubName();
})