import { msTeamsUtils } from "../../aptTeamsApp/MsTeamsUtils";
import { LogLevel, setLogLevel, setLogFunction, createMicrosoftGraphClient, TeamsFx, IdentityType } from "@microsoft/teamsfx";
import { getAuthEvents, LOGGED_BASIC_INFO } from "./AuthEvent";
import { getScopes } from "../../aptTeamsApp/scope";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { getMsProperties } from "./Properties";
import { app } from "@microsoft/teams-js";
import { MsToNativeLoginBridge } from "@aptero/axolotis-module-basic";
import { getService } from "@aptero/axolotis-player";
import { COOKIE_STORE_SERVICE } from "@aptero/axolotis-module-basic";
import { CookieStore } from "@aptero/axolotis-module-basic";

let credential: TeamsFx | null = null;
export const startLoginPageUrl = window.location.origin + "/auth-start.html";

declare const window;
//To test and revoke application auth
// https://myapplications.microsoft.com/
// https://portal.office.com/account/?ref=MeControl#apps

function initTeamsFx(authorityHost) {
  if (process.env.NODE_ENV === "development") {
    setLogLevel(LogLevel.Warn);
    setLogFunction((leve, message) => {
      console.warn(message);
    });
  }
  //https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teamsfx-sdk
  credential = new TeamsFx(IdentityType.User, {
    authorityHost,
    initiateLoginEndpoint: startLoginPageUrl,
    //simpleAuthEndpoint: teamsfxEndpoint,//https://github.com/OfficeDev/TeamsFx/wiki/How-Authentication-Works-in-TeamsFx-Tab-Template
    clientId: getMsProperties().MICROSOFT_APP_ID, //process.env.REACT_APP_CLIENT_ID;
  });
}

const FORCE_STAY_LOGOUT = "ms_force_stay_logout";

export class TeamsLoginService {
  constructor(private microsoftGraphService: MicrosoftGraphService, private msToNativeLoginBridge: MsToNativeLoginBridge) {}

  getCredential() {
    if (!credential) {
      initTeamsFx("common");
    }
    if (!credential) {
      throw new Error("");
    }
    return credential;
  }

  async initBasicInfo() {
    const cred = this.getCredential();
    await cred.getUserInfo();
    getAuthEvents().emit(LOGGED_BASIC_INFO);
    return cred;
  }

  async initGraph(scopes) {
    try {
      const graph = createMicrosoftGraphClient(credential, scopes);
      if (!credential) {
        throw new Error();
      }
      this.microsoftGraphService.init(graph);
    } catch (e) {
      if (e.toString().indexOf("please login first") !== -1) {
        console.info("app not authorized - no graph support");
      } else {
        console.error(e);
      }
    }
  }

  //store the tenant
  //id
  // JWT decripting of the token
  async userInteractionAuth() {
    console.log("TeamsLoginService : userInteractionAuth");
    let cookieStore = await getService<CookieStore>(COOKIE_STORE_SERVICE);
    cookieStore.remove(FORCE_STAY_LOGOUT); //Only in case of user requested login do we remove this flag
    const cred = await this.initBasicInfo();
    //await cred.login(getScopesLight()); //Trigger authorization popup
    const userInfo = await cred.getUserInfo(); //confirmed by stephano no user popup
    await this.initBasic(userInfo, true);
    await this.msToNativeLoginBridge.setProfile({
      displayName: userInfo.displayName,
    }); //HACK reset the display name since another process in the code seems to set Guest name
    return cred;
  }

  async upgrade() {
    console.log("upgrade");
    let scope = getScopes();
    const cred = await this.initBasicInfo();
    await cred.login(scope); //Trigger authorization popup
    await this.initGraph(scope);
    const userInfo = await cred.getUserInfo();
    await this.initBasic(userInfo, true);
    return cred;
  }

  async passiveLogin() {
    if (!msTeamsUtils()) {
      throw new Error("not in teams");
    }
    try {
      await app.initialize();
    } catch (e) {
      console.warn("microsoftTeams.initialize failed (probably not in teams so we skip it)", e);
      return;
    }
    let cookieStore = await getService<CookieStore>(COOKIE_STORE_SERVICE);
    //!this.msToNativeLoginBridge.isLogged()
    if (cookieStore.get(FORCE_STAY_LOGOUT)) {
      return;
    }
    try {
      //if msteams
      // log using token from msteams
      //if cookie oauth microsoft
      // Initialize the Microsoft Teams SDK
      const cred = await this.initBasicInfo();
      const userInfo = await cred.getUserInfo();
      console.log("passiveAuth (basic):", cred);
      await this.initBasic(userInfo, false);
    } catch (e) {
      //passive login should never fail - just ignore
      console.warn("passive login failed", e);
      let cookieStore = await getService<CookieStore>(COOKIE_STORE_SERVICE);
      cookieStore.remove(FORCE_STAY_LOGOUT); //Only in case of user requested login do we remove this flag (avoid loop of login in case of fail)
    }
  }

  isUserBasicLogged() {
    return (
      this.msToNativeLoginBridge.getProfile().microsoftUser && this.msToNativeLoginBridge.getProfile().displayName && window.APP.store.state.credentials.token
    );
  }

  isGraphDataFilled() {
    return (
      this.msToNativeLoginBridge.getProfile().jobTitle ||
      this.msToNativeLoginBridge.getProfile().phoneNumber ||
      this.msToNativeLoginBridge.getProfile().companyName ||
      this.msToNativeLoginBridge.getProfile().microsoftUserprofilePicture
    );
  }

  async initBasic(basicUserInfo, force) {
    if (this.microsoftGraphService.isInitialized() && !this.isGraphDataFilled()) {
      //graph initialized but graph information not set => force relogin with new information
      force = true;
    }
    if (this.isUserBasicLogged() && !force) {
      //Do not  force login if user is already logged
      return;
    }
    console.log("initBasic : ", basicUserInfo);
    //in this case we login without a graph token
    //only this data available {"displayName":"Admin Aptero","objectId":"abb64646-d3e2-473d-8d13-0b6faff23605","preferredUserName":"admin@aptero.co"}
    const user: any = {};
    user.email = basicUserInfo.preferredUserName;
    user.displayName = basicUserInfo.displayName;
    user.id = basicUserInfo.objectId;

    let profilePicture = "";
    let organization = "";
    let phoneNumber = "";
    let jobTitle = "";
    if (this.microsoftGraphService.isInitialized()) {
      const user = await this.microsoftGraphService.getUserDetails();
      phoneNumber = user.mobilePhone;
      jobTitle = user.jobTitle;
      profilePicture = await this.microsoftGraphService.getUserPhotoAsBase64();
      organization = await this.microsoftGraphService.getUserOrganization();
    }
    const cred = await this.initBasicInfo();
    let token = user.id;
    await this.msToNativeLoginBridge.setProfile({
      email: user.email,
      displayName: user.displayName,
      phoneNumber: phoneNumber,
      jobTitle: jobTitle,
      companyName: organization,
      microsoftUserprofilePicture: profilePicture,
      microsoftUser: user.id,
    });
    await this.msToNativeLoginBridge.nativeLogin(user.email, token);
  }

  async logout() {
    let cookieStore = await getService<CookieStore>(COOKIE_STORE_SERVICE);
    cookieStore.set(FORCE_STAY_LOGOUT, "true");
    await this.msToNativeLoginBridge.logout();
  }
}
