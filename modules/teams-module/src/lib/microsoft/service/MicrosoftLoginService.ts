import { msTeamsUtils } from "../../aptTeamsApp/MsTeamsUtils";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { MicrosoftOauthLoginService } from "./MicrosoftOauthLoginService";
import { TeamsLoginService } from "./TeamsLoginService";
import { MsToNativeLoginBridge } from "@aptero/axolotis-module-basic";
import { getAuthEvents, AUTH_SERVICE_INITIALIZE } from "./AuthEvent";
import { AuthInterface } from "@aptero/axolotis-module-basic";

export class MicrosoftLoginService implements AuthInterface {
  authInProgress = false;
  msGraphService = new MicrosoftGraphService();
  microsoftOauthLoginService: MicrosoftOauthLoginService;
  teamsLoginService: TeamsLoginService;
  private initialized: boolean = false;

  getTeamsLoginService() {
    return this.teamsLoginService;
  }

  constructor(private msToNativeLoginBridge: MsToNativeLoginBridge) {
    this.microsoftOauthLoginService = new MicrosoftOauthLoginService(this.msGraphService, this.msToNativeLoginBridge);
    this.teamsLoginService = new TeamsLoginService(this.msGraphService, this.msToNativeLoginBridge);
    this.onReady().then(() => {
      this.initialized = true;
    });
  }

  async onReady(): Promise<boolean> {
    if (this.initialized) {
      return Promise.resolve(true);
    } else {
      return new Promise<boolean>((resolve) => {
        const onInitialized = () => {
          getAuthEvents().off(AUTH_SERVICE_INITIALIZE, onInitialized);
          resolve(true);
        };
        getAuthEvents().on(AUTH_SERVICE_INITIALIZE, onInitialized);
      });
    }
  }

  async passiveLogin() {
    if (!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(() => {
        this.authInProgress = false;
      }, 1000);
      if (msTeamsUtils()) {
        await this.teamsLoginService.passiveLogin();
        this.authInProgress = false;
      } else {
        await this.microsoftOauthLoginService.passiveLogin();
        this.authInProgress = false;
      }
      getAuthEvents().emit(AUTH_SERVICE_INITIALIZE);
    }
  }

  private async loginInternal() {
    if (!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(() => {
        this.authInProgress = false;
      }, 1000);
      if (msTeamsUtils()) {
        await this.teamsLoginService.userInteractionAuth();
        this.authInProgress = false;
      } else {
        await this.microsoftOauthLoginService.login();
        this.authInProgress = false;
      }
    }
  }

  async login(nofail = true) {
    if (nofail) {
      try {
        return await this.loginInternal();
      } catch (e) {
        this.authInProgress = false;
        //avoid any throw
        console.error(e);
      }
    } else {
      return await this.loginInternal();
    }
  }

  getUserAccount() {
    return this.msToNativeLoginBridge.getUserAccount();
  }

  getName() {
    return this.msToNativeLoginBridge.getName();
  }

  async logout() {
    if (!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(() => {
        this.authInProgress = false;
      }, 1000);
      this.msToNativeLoginBridge.clearProfile();
      if (msTeamsUtils()) {
        await this.teamsLoginService.logout();
        this.authInProgress = false;
      } else {
        await this.microsoftOauthLoginService.logout();
        this.authInProgress = false;
      }
    }
  }

  displayProfilePhoto() {
    return this.msToNativeLoginBridge.displayProfilePhoto();
  }

  isSignedIn() {
    return this.msToNativeLoginBridge.isLogged();
  }

  getAccount(): { email; displayName; id } {
    return { displayName: undefined, email: undefined, id: undefined };
  }

  passiveLogIn(): Promise<void> {
    return this.passiveLogin();
  }

  signIn(): Promise<void> {
    return this.login();
  }

  signOut(): Promise<void> {
    return this.signOut();
  }
}
