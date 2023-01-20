import { PublicClientApplication } from "@azure/msal-browser";
import { getScopesLight } from "../../aptTeamsApp/scope";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { MsToNativeLoginBridge } from "@aptero/axolotis-module-basic";
import { getMsProperties } from "./Properties";
let graph = require("@microsoft/microsoft-graph-client");

declare const window;

export class MicrosoftOauthLoginService {
  accessToken = null;
  private publicClientApplication: PublicClientApplication | undefined;

  constructor(private microsoftGraphService: MicrosoftGraphService, private msToNativeLoginBridge: MsToNativeLoginBridge) {}

  getPublicClientApplication() {
    if (!this.publicClientApplication) {
      this.publicClientApplication = new PublicClientApplication({
        auth: {
          clientId: getMsProperties().MICROSOFT_APP_ID,
          redirectUri: window.location.origin + "/signin",
          // to allow only AAD accounts: authority:https://login.microsoftonline.com/organizations
          authority: getMsProperties().MICROSOFT_APP_AUTHORITY || "https://login.microsoftonline.com/common",
        },
        cache: {
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: true,
        },
      });
    }
    return this.publicClientApplication;
  }

  async passiveLogin() {
    if (window.APP.store.state.profile.microsoftUser && !this.accessToken) {
      try {
        //  try silent login
        const account = this.getPublicClientApplication().getAllAccounts()[0];
        const accessTokenRequest = {
          scopes: getScopesLight(),
          account: account,
        };
        let authenticationResult = await this.getPublicClientApplication().acquireTokenSilent(accessTokenRequest);
        console.log(authenticationResult.accessToken);
        this.initWithToken(authenticationResult.accessToken);
      } catch (err) {
        console.error(err);
        // logout Moz to be sync
        //this.store.state.profile.microsoftUser = false; //will be done by the logout/signout
        this.accessToken = null; //passive clean of acces token
        this.msToNativeLoginBridge.clearProfile();
      }
    }
  }

  setNewToken(token) {
    this.accessToken = token;
    const client = graph.Client.init(
      {
        authProvider: (done) => {
          done(null, this.accessToken);
        },
      },
      this.accessToken
    );
    this.microsoftGraphService.init(client);
  }

  async initWithToken(token) {
    this.setNewToken(token);
    const user = await this.microsoftGraphService.getUserDetails();
    let profilePicture = "";
    let organization = "";
    try {
      profilePicture = await this.microsoftGraphService.getUserPhotoAsBase64();
      organization = await this.microsoftGraphService.getUserOrganization();
    } catch (e) {
      //ignore error from beta organisation
      console.error(e);
    }

    await this.msToNativeLoginBridge.setProfile({
      email: user.userPrincipalName || user.mail || user.email,
      displayName: user.displayName,
      phoneNumber: user.mobilePhone,
      jobTitle: user.jobTitle,
      companyName: organization,
      microsoftUserprofilePicture: profilePicture,
      microsoftUser: user.id,
    });
    const email = user.userPrincipalName || user.mail || user.email;
    await this.msToNativeLoginBridge.nativeLogin(email, token);
  }

  async login() {
    console.log("MicrosoftOauthLoginService : userInteractionAuth");
    try {
      const loginRequest = {
        scopes: getScopesLight(),
      };
      let response = await this.getPublicClientApplication().loginPopup(loginRequest);
      await this.initWithToken(response.accessToken);
    } catch (error) {
      console.error("error", error);
    }
  }

  async logout() {
    if (window.APP.store.state.profile.microsoftUser) {
      this.msToNativeLoginBridge.clearProfile();
      if (this.publicClientApplication) {
        return this.getPublicClientApplication().logoutPopup();
      }
    }
  }
}
