export * from "./properties/Properties";
export * from "./nameGeneration/NameGenerationService";
export * from "./phoenixAuth/PhoenixAuthService";
export * from "./phoenixAuth/MsToNativeLoginBridge";
export * from "./common/AuthInterface";
export * from "./roomAPI/RoomService";
export * from "./store/CookieStore";
export * from "./store/Store";

//NOTE the ids are duplicated in the src import helper
export const PROPERTIES_SERVICE = "@aptero/axolotis-module-properties/Properties";
export const STORE_SERVICE = "@aptero/axolotis-module-storage/Store";
export const COOKIE_STORE_SERVICE = "@aptero/axolotis-module-storage/CookieStore";
export const PHX_AUTH_SERVICE = "@aptero/axolotis-module-phx-auth/PhoenixAuthService";
export const NAME_SERVICE = "@aptero/axolotis-module-name/NameService";
export const ROOM_SERVICE = "@aptero/axolotis-module-room/RoomService";
