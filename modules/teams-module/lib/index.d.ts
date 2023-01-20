import { Item, ModulePromise } from "@aptero/axolotis-player";
/**
 * Should only import type to stay lightweight
 */
import type { MsTeamsAPILight } from "./microsoft/MsTeamsAPILight";
import type { MsTeamsAPI } from "./microsoft/MsTeamsAPI";
export type { MicrosoftLoginService } from "./microsoft/service/MicrosoftLoginService";
export declare const MICROSOFT_SERVICE = "@aptero/axolotis-module-teams/MicrosoftService";
export declare const MICROSOFT_STATIC_SERVICE = "@aptero/axolotis-module-teams/MicrosoftStaticService";
export declare const PROPERTIES_SERVICE = "@aptero/axolotis-module-properties/Properties";
export declare const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export declare const PROCESS_DEEPLINK = "ms-teams-deep-link";
export declare const MSTEAMS_QUERY_PARAM = "msteams";
export declare function msTeamsAPILight(): MsTeamsAPILight;
export declare function msTeamsAPILightAsync(): Promise<MsTeamsAPILight>;
export declare function msTeamsAPI(): Promise<MsTeamsAPI>;
export declare class AxItem implements Item {
    private moduleMicrosoftService;
    private moduleMicrosoftStaticService;
    constructor(moduleMicrosoftService: ModulePromise, moduleMicrosoftStaticService: ModulePromise);
    modules(): {
        [id: string]: ModulePromise;
    };
}
export declare const registerWithImport: (moduleMicrosoftService: ModulePromise, moduleMicrosoftStaticService: ModulePromise) => void;
