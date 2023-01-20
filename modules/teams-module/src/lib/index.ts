import { Item, getService, getServiceSync, ModulePromise } from "@aptero/axolotis-player";
/**
 * Should only import type to stay lightweight
 */
import type { MsTeamsAPILight } from "@root/lib/microsoft/MsTeamsAPILight";
import type { MsTeamsAPI } from "@root/lib/microsoft/MsTeamsAPI";
export type { MicrosoftLoginService } from "@root/lib/microsoft/service/MicrosoftLoginService";
import { getGlobalStorageValue, GLOBAL_WORLDS_ENTITY, registerItem, WorldEntity } from "@aptero/axolotis-player";

/*
AX IMPORT HELPER
 */
export const MICROSOFT_SERVICE = "@aptero/axolotis-module-teams/MicrosoftService";
export const MICROSOFT_STATIC_SERVICE = "@aptero/axolotis-module-teams/MicrosoftStaticService";
export const PROPERTIES_SERVICE = "@aptero/axolotis-module-properties/Properties";

export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const PROCESS_DEEPLINK = "ms-teams-deep-link";
export const MSTEAMS_QUERY_PARAM = "msteams";

//msTeamsAPILight
export function msTeamsAPILight(): MsTeamsAPILight {
  return getServiceSync<MsTeamsAPILight>(MICROSOFT_STATIC_SERVICE);
}

//Helps to transition to 100% async
export function msTeamsAPILightAsync(): Promise<MsTeamsAPILight> {
  return getService<MsTeamsAPILight>(MICROSOFT_STATIC_SERVICE);
}

//msTeamsAPI
export async function msTeamsAPI(): Promise<MsTeamsAPI> {
  return getService<MsTeamsAPI>(MICROSOFT_SERVICE);
}

/*
AX ITEM
 */

export class AxItem implements Item {
  constructor(private moduleMicrosoftService: ModulePromise, private moduleMicrosoftStaticService: ModulePromise) {
    console.log("@aptero/axolotis-module-teams installed");
  }

  modules(): { [id: string]: ModulePromise } {
    let ret: { [id: string]: ModulePromise } = {};
    ret[MICROSOFT_SERVICE] = this.moduleMicrosoftService;
    ret[MICROSOFT_STATIC_SERVICE] = this.moduleMicrosoftStaticService;
    /*ret[MICROSOFT_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-teams/dist-index");
      return { module, classname: "MsTeamsAPIFactory" /*module.MsTeamsAPIFactory.name* };
    };
    ret[MICROSOFT_STATIC_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-teams/dist-index-light");
      return { module, classname: "MsTeamsAPILight" /*module.MsTeamsAPILight.name* };
    };*/
    return ret;
  }
}

export const registerWithImport = (moduleMicrosoftService: ModulePromise, moduleMicrosoftStaticService: ModulePromise) => {
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if (!(worlds && worlds.length > 0)) {
    throw new Error("Axolotis World Needs to be initialized");
  }
  registerItem(new AxItem(moduleMicrosoftService, moduleMicrosoftStaticService)); //auto registration of service
};

/*
export const register = () => {
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if (!(worlds && worlds.length > 0)) {
    throw new Error("Axolotis World Needs to be initialized");
  }
  registerItem(new AxItem()); //auto registration of service
};*/
