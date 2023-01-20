import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { MicrosoftOauthLoginService } from "./MicrosoftOauthLoginService";
import { TeamsLoginService } from "./TeamsLoginService";
import { MsToNativeLoginBridge } from "@aptero/axolotis-module-basic";
import { AuthInterface } from "@aptero/axolotis-module-basic";
export declare class MicrosoftLoginService implements AuthInterface {
    private msToNativeLoginBridge;
    authInProgress: boolean;
    msGraphService: MicrosoftGraphService;
    microsoftOauthLoginService: MicrosoftOauthLoginService;
    teamsLoginService: TeamsLoginService;
    private initialized;
    getTeamsLoginService(): TeamsLoginService;
    constructor(msToNativeLoginBridge: MsToNativeLoginBridge);
    onReady(): Promise<boolean>;
    passiveLogin(): Promise<void>;
    private loginInternal;
    login(nofail?: boolean): Promise<void>;
    getUserAccount(): any;
    getName(): any;
    logout(): Promise<void>;
    displayProfilePhoto(): any;
    isSignedIn(): boolean;
    getAccount(): {
        email: any;
        displayName: any;
        id: any;
    };
    passiveLogIn(): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
}
