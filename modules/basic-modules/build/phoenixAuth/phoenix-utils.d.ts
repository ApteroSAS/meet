import { PropertiesFormat } from "./PropertiesFormat";
export declare function config(): PropertiesFormat;
export declare function hasReticulumServer(): boolean;
export declare function isLocalClient(): boolean;
export declare function hubUrl(hubId: any, extraParams: any, slug: any): any;
export declare function getReticulumFetchUrl(path: any, absolute?: boolean, host?: any, port?: any): any;
export declare function getReticulumMeta(): Promise<any>;
export declare function getDirectReticulumFetchUrl(path: any, absolute?: boolean): any;
export declare function invalidateReticulumMeta(): Promise<void>;
export declare function connectToReticulum(debug?: boolean, params?: any, socketClass?: any): Promise<any>;
export declare function getLandingPageForPhoto(photoUrl: any): any;
export declare function fetchReticulumAuthenticated(url: any, method: string, payload: any): Promise<any>;
export declare function createAndRedirectToNewHub(name: any, sceneId: any, replace: any): Promise<void>;
export declare function getPresenceEntryForSession(presences: any, sessionId: any): any;
export declare function getPresenceContextForSession(presences: any, sessionId: any): any;
export declare function getPresenceProfileForSession(presences: any, sessionId: any): any;
export declare function migrateChannelToSocket(oldChannel: any, socket: any, params: any): Promise<unknown>;
export declare function migrateToChannel(oldChannel: any, newChannel: any): Promise<unknown>;
export declare function discordBridgesForPresences(presences: any): any[];
export declare function hasEmbedPresences(presences: any): boolean;
export declare function denoisePresence({ onJoin, onLeave, onChange }: {
    onJoin: any;
    onLeave: any;
    onChange: any;
}): {
    rawOnJoin: (key: any, beforeJoin: any, afterJoin: any) => void;
    rawOnLeave: (key: any, remaining: any, removed: any) => void;
};
export declare function presenceEventsForHub(events: any): {
    onJoin: (key: any, meta: any) => void;
    onLeave: (key: any, meta: any) => void;
    onChange: (key: any, previous: any, current: any) => void;
};
export declare const tryGetMatchingMeta: ({ ret_pool, ret_version }: {
    ret_pool: any;
    ret_version: any;
}, shouldAbandonMigration: any) => Promise<boolean>;
