import { createWorld, getGlobalStorageValue, GLOBAL_WORLDS_ENTITY, WorldEntity } from "@aptero/axolotis-player";
import { register as registerBasic } from "./modules/basic";
import { registerWithImport as registerTeams } from "@aptero/axolotis-module-teams";

export async function initAxolotisPlayer() {
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if (worlds && worlds.length > 0) {
    throw new Error("Axolotis World already initialized");
  }
  await createWorld();
  registerBasic();
  registerTeams(
    //asynchron import should be done it the parent project to avoid issue with webpack packing the async files
    async () => {
      // @ts-ignore TODO fix lib
      const module = await import("@aptero/axolotis-module-teams/dist-index-ms");
      return { module, classname: "MsTeamsAPIFactory" /*module.MsTeamsAPIFactory.name*/ };
    },
    async () => {
      // @ts-ignore TODO fix lib
      const module = await import("@aptero/axolotis-module-teams/dist-index-ms-light");
      return { module, classname: "MsTeamsAPILight" /*module.MsTeamsAPILight.name*/ };
    }
  );
  console.log("Axolotis player : loaded");
}
