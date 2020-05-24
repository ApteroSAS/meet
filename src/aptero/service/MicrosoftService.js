import * as microsoftTeams from "@microsoft/teams-js";
import * as Msal from "msal";
import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from "@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions";
import { Client } from "@microsoft/microsoft-graph-client/lib/src/Client";
import configs from "../../utils/configs";
window.Buffer = window.Buffer || require('buffer').Buffer;

const EventEmitter = require("eventemitter3");

export class MicrosoftService{
  eventEmitter = new EventEmitter();
  acessToken = null;
  preloaded = {};
  scopes = ["user.read","Files.Read.All"];
  msalConfig = {
    auth: {
      clientId: configs.APP_CONFIG.MICROSOFT_APP_ID,
    },
    cache: {
      cacheLocation: 'localStorage'
    }
  };

  loginRequest = {
    //https://docs.microsoft.com/en-us/graph/permissions-reference
    scopes: this.scopes, // optional Array<string>
  };


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
    this.passiveLogin().then((res) => console.log(res)).catch(err => console.error(err));
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
    return this.preloaded[url] || url;
  }

  getName(){
    return this.getUserAccount() && this.getUserAccount().name;
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
        reject(err);
      });
    });
  }

  processLogged(response){
    this.acessToken = response.accessToken;
    this.eventEmitter.emit("auth",this.getUserAccount());
  }

  async passiveLogin() {
    // if using cdn version, 'Msal' will be available in the global scope
    return new Promise((resolve, reject) => {
      // if the user is already logged in you can acquire a token
      if (this.msalInstance.getAccount()) {
        this.msalInstance.acquireTokenSilent(this.loginRequest)
          .then(response => {
            // get access token from response
            this.processLogged(response);
            resolve(response);
          })
          .catch(err => {
            reject(err);
          });
      }else{
        resolve(null);
      }
    });
  }

  async loginWithRedirect(){
    window.location.href = window.location.origin+"/microsoft.html"
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
microsoftService.start();