import { app } from "@microsoft/teams-js";
export declare function sendEvent(type: any, data: any): void;
export declare function getMSEvents(): any;
export declare function msTeamsUtils(): boolean;
export declare function changeUrlSettings(url: any): void;
export declare function getContext(callback: (context: app.Context) => void): Promise<void>;
export declare function processDeepLink(link: any): void;
