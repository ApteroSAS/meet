import { getService, getServiceSync } from "@aptero/axolotis-player";
/**
 * Should only import type to stay lightweight
 */
import type { Properties } from "@aptero/axolotis-module-basic";
import type { RoomService } from "@aptero/axolotis-module-basic";
import type { PhoenixAuthService } from "@aptero/axolotis-module-basic";
import type { NameGenerationService } from "@aptero/axolotis-module-basic";
import type { CookieStore } from "@aptero/axolotis-module-basic";
import type { Store } from "@aptero/axolotis-module-basic";

//NOTE the ids are duplicated from the async src index.js
export const PROPERTIES_SERVICE = "@aptero/axolotis-module-properties/Properties";
export const STORE_SERVICE = "@aptero/axolotis-module-storage/Store";
export const COOKIE_STORE_SERVICE = "@aptero/axolotis-module-storage/CookieStore";
export const PHX_AUTH_SERVICE = "@aptero/axolotis-module-phx-auth/PhoenixAuthService";
export const NAME_SERVICE = "@aptero/axolotis-module-name/NameService";
export const ROOM_SERVICE = "@aptero/axolotis-module-room/RoomService";

export async function propertyService(): Promise<Properties> {
  return getService<Properties>(PROPERTIES_SERVICE);
}

export async function roomService(): Promise<RoomService> {
  return getService<RoomService>(ROOM_SERVICE);
}

/* needs preload before usage */
export function roomServiceSync(): RoomService {
  return getServiceSync<RoomService>(ROOM_SERVICE);
}

export async function nameGenerationService(): Promise<NameGenerationService> {
  return getService<NameGenerationService>(NAME_SERVICE);
}

export async function phoenixAuth(): Promise<PhoenixAuthService> {
  return getService<PhoenixAuthService>(PHX_AUTH_SERVICE);
}

export async function cookiesStore(): Promise<CookieStore> {
  return getService<CookieStore>(COOKIE_STORE_SERVICE);
}

export async function store(): Promise<Store> {
  return getService<Store>(STORE_SERVICE);
}
