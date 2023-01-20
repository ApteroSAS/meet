import { PublicClientApplication } from "@azure/msal-browser";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { MsToNativeLoginBridge } from "@aptero/axolotis-module-basic";
export declare class MicrosoftOauthLoginService {
    private microsoftGraphService;
    private msToNativeLoginBridge;
    accessToken: any;
    private publicClientApplication;
    constructor(microsoftGraphService: MicrosoftGraphService, msToNativeLoginBridge: MsToNativeLoginBridge);
    getPublicClientApplication(): PublicClientApplication;
    passiveLogin(): Promise<void>;
    setNewToken(token: any): void;
    initWithToken(token: any): Promise<void>;
    login(): Promise<void>;
    logout(): Promise<void>;
}
