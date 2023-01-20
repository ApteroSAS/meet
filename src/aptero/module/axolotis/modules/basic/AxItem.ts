import { ModulePromise } from "@aptero/axolotis-player";
import { Item } from "@aptero/axolotis-player";
import { COOKIE_STORE_SERVICE, NAME_SERVICE, PHX_AUTH_SERVICE, PROPERTIES_SERVICE, ROOM_SERVICE, STORE_SERVICE } from "./ImportHelper";

export class AxItem implements Item {
  constructor() {
    console.log("@aptero/axolotis-module-basic installed");
  }

  modules(): { [id: string]: ModulePromise } {
    let ret: { [id: string]: ModulePromise } = {};
    ret[PROPERTIES_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-basic");
      return { module, classname: "Properties" /*module.Properties.name*/ };
    };
    ret[STORE_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-basic");
      return { module, classname: "Store" /*module.Store.name*/ };
    };
    ret[PHX_AUTH_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-basic");
      return { module, classname: "PhoenixAuthServiceFactory" /*module.PhoenixAuthServiceFactory.name*/ };
    };
    ret[NAME_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-basic");
      return { module, classname: "NameGenerationService" /*module.NameGenerationService.name*/ };
    };
    ret[COOKIE_STORE_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-basic");
      return { module, classname: "CookieStore" /*module.CookieStore.name*/ };
    };
    ret[ROOM_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-basic");
      return { module, classname: "RoomServiceFactory" /*module.RoomService.name*/ };
    };
    return ret;
  }
}
