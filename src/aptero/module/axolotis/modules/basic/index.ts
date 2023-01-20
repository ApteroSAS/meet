import { getGlobalStorageValue, GLOBAL_WORLDS_ENTITY, registerItem, WorldEntity } from "@aptero/axolotis-player";
import { AxItem } from "./AxItem";

export type { Properties } from "@aptero/axolotis-module-basic";
export type { NameGenerationService } from "@aptero/axolotis-module-basic";
export type { RoomService } from "@aptero/axolotis-module-basic";
export type { PhoenixAuthService } from "@aptero/axolotis-module-basic";
export type { CookieStore } from "@aptero/axolotis-module-basic";
export type { Store } from "@aptero/axolotis-module-basic";
export type { AuthInterface } from "@aptero/axolotis-module-basic";

export * from "./ImportHelper";

export const register = () => {
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if (!(worlds && worlds.length > 0)) {
    throw new Error("Axolotis World Needs to be initialized");
  }
  registerItem(new AxItem()); //auto registration of service
};
