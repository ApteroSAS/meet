import * as microsoftTeams from "@microsoft/teams-js";
import * as Msal from "msal";
import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from "@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions";
import { Client } from "@microsoft/microsoft-graph-client/lib/src/Client";
import configs from "../../utils/configs";
window.Buffer = window.Buffer || require('buffer').Buffer;

const EventEmitter = require("eventemitter3");
export const MICROSOFT_AUTH_ERROR = "error_microsoft_not_authorized";

export class MicrosoftService{
  eventEmitter = new EventEmitter();
  defaultNoAuthImage = configs.APP_CONFIG.GLOBAL_ASSETS_PATH+"microsoft_not_authorized.png";
  acessToken = null;
  preloaded = {};
  scopes = ["User.Read","Files.Read"];
  msalConfig = {
    auth: {
      clientId: configs.APP_CONFIG.MICROSOFT_APP_ID,
      //https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-client-application-configuration
      //https://myaccount.microsoft.com/organizations
      //https://stackoverflow.com/questions/47240071/msal-and-azure-ad-what-scopes-should-i-pass-when-i-just-want-to-get-the-user-id
      authority:configs.APP_CONFIG.MICROSOFT_APP_AUTHORITY || "https://login.microsoftonline.com/common",
      //authority:"https://login.microsoftonline.com/loreal.onmicrosoft.com",
      //authority:"https://login.microsoftonline.com/apteroco.onmicrosoft.com",
      redirectUri:window.location.origin+"/microsoft.html",
      postLogoutRedirectUri: window.location.href,
    },
    cache: {
      cacheLocation: 'localStorage'
    }
  };

  loginRequest = {
    //https://docs.microsoft.com/en-us/graph/permissions-reference
    scopes: this.scopes, // optional Array<string>
  };

  constructor(){}

  async start(defaultRedirectAction){
    if(!defaultRedirectAction){
      defaultRedirectAction = ()=>{
        window.location.reload();
      }
    }
    //this.overrideXHRSendRequest();
    this.msalInstance = new Msal.UserAgentApplication(this.msalConfig);
    const options = new MSALAuthenticationProviderOptions(this.scopes);
    this.authProvider = new ImplicitMSALAuthenticationProvider(this.msalInstance, options);
    this.msalInstance.handleRedirectCallback(() => {
      defaultRedirectAction();
    });
    const options2 = {
      authProvider : this.authProvider, // An instance created from previous step
    };
    this.client = Client.initWithMiddleware(options2);
    await microsoftTeams.initialize();
    this.passiveLogin();
  }

  urlToToSharingToken(url) {
    let trimEnd = function(str, c) {
      c = c ? c : ' ';
      let i = str.length - 1;
      for (; i >= 0 && str.charAt(i) == c; i--);
      return str.substring(0, i + 1);
    };
    let value = Buffer.from(url).toString('base64');
    return "u!" + trimEnd(value, '=').replace(/\//g, '_').replace(/\+/g, '-');
  }

  async preFetchConvertMicrosoftUrl(url){
    return this.convertMicrosoftUrl(url);
  }

  convertMicrosoftUrlSync(url){
    this.preFetchConvertMicrosoftUrl(url);
    return this.preloaded[url] || url;
  }

  getName(){
    if(this.msalInstance) {
      return this.getUserAccount() && this.getUserAccount().name;
    }else{
      return null;
    }
  }

  async convertMicrosoftUrl(url){
    if(url.indexOf("sharepoint.com")===-1){
      return url;
    }else {
      console.log("convertMicrosoftUrl")
      if(this.getUserAccount()) {
        let res = await this.convertSharingUrlToDownloadUrl(url);
        this.preloaded[url] = res;
        return res;
      }else{
        console.log("passiveLoginWithTeams")
        await this.passiveLogin();
        if(this.getUserAccount()) {
          let res = await this.convertSharingUrlToDownloadUrl(url);
          this.preloaded[url] = res;
          return res;
        }else{
          console.log("loginWithRedirect")
          await this.loginWithRedirect();
        }
      }
    }
  }

  async convertSharingUrlToDownloadUrl(url){
    return new Promise((resolve, reject) => {
      const stoken = this.urlToToSharingToken(url);
      this.client.api('/shares/'+stoken+'/driveItem').get().then((res) => {
        resolve(res["@microsoft.graph.downloadUrl"]);
      }).catch((err)=>{
        console.warn(err);
        //reject(err);
        resolve(MICROSOFT_AUTH_ERROR);
      });
    });
  }

  processLogged(response){
    this.acessToken = response.accessToken;
    this.eventEmitter.emit("auth",this.getUserAccount());
    console.log("processLogged :",this.getUserAccount())
    const url = "https://graph.microsoft.com/v1.0/me";
    this.client.api(url).get().then((res) => {
      console.log(res);
    }).catch((err)=>{
      console.error(err)
    });
  }

  handleError(error) {
    if (error.errorCode === 'consent_required'
      || error.errorCode === 'interaction_required'
      || error.errorCode === 'login_required') {
      this.loginWithRedirect();
      return;
    }
    console.warn(error);
  }

  async passiveLogin() {
    // if using cdn version, 'Msal' will be available in the global scope
    return new Promise((resolve, reject) => {
      // if the user is already logged in you can acquire a token
      if (this.msalInstance.getAccount()) {
        this.msalInstance.acquireTokenSilent(this.loginRequest)
          .then(response => {
            // get access token from response
            this.acessToken = response.accessToken;
            resolve(response);
          })
          .catch(err => {
            this.handleError(err);
          });
      }else{
        resolve(null);
      }
    });
  }

  async loginWithRedirect(){
    if(window.location.href !== window.location.origin+"/microsoft.html") {
      window.location.href = window.location.origin + "/microsoft.html"
    }
  }

  async loginWithRedirectInternal(){
    return new Promise((resolve, reject) => {
      // user is not logged in, you will need to log them in to acquire a token
      this.msalInstance.loginRedirect(this.loginRequest)
        .then(response => {
          this.processLogged(response);
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getUserAccount(){
    return this.msalInstance.getAccount();
  }

  async logout(){
    return new Promise((resolve, reject) => {
      if(this.msalInstance.getAccount()) {
        this.msalInstance.logout().then(response => {
          resolve(response);
        }).catch(err => {
          reject(err);
        });
      }else{
        resolve("already");
      }
    });
  }

}

export const microsoftService = new MicrosoftService();