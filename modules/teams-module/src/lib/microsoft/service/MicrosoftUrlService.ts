import { MicrosoftLoginService } from "./MicrosoftLoginService";
import { Buffer } from "buffer/";
import { deepLinkService } from "./DeepLinkService";
import { MICROSOFT_AUTH_ERROR } from "../MsTeamsAPILight";
deepLinkService.start();

export class MicrosoftUrlService {
  preloaded = {};

  constructor(private microsoftLoginService: MicrosoftLoginService) {}

  urlToToSharingToken(url) {
    let trimEnd = function (str, c) {
      c = c ? c : " ";
      let i = str.length - 1;
      while (i >= 0 && str.charAt(i) === c) {
        i--;
      }
      return str.substring(0, i + 1);
    };
    let value = Buffer.from(url).toString("base64");
    return "u!" + trimEnd(value, "=").replace(/\//g, "_").replace(/\+/g, "-");
  }

  async preFetchConvertMicrosoftUrl(url) {
    return this.convertMicrosoftUrl(url);
  }

  convertMicrosoftUrlSync(url) {
    this.preFetchConvertMicrosoftUrl(url);
    return this.preloaded[url] || url;
  }

  async convertMicrosoftUrl(url) {
    if (url.indexOf("sharepoint.com") === -1) {
      return url;
    } else {
      console.log("convertMicrosoftUrl");
      if (this.microsoftLoginService.getUserAccount()) {
        let res = await this.convertSharingUrlToDownloadUrl(url);
        this.preloaded[url] = res;
        return res;
      } else {
        console.log("passiveLoginWithTeams");
        await this.microsoftLoginService.passiveLogin();
        if (this.microsoftLoginService.getUserAccount()) {
          let res = await this.convertSharingUrlToDownloadUrl(url);
          this.preloaded[url] = res;
          return res;
        } else {
          console.log("loginWithRedirect");
          await this.microsoftLoginService.login();
        }
      }
    }
  }

  async convertSharingUrlToDownloadUrl(url) {
    return new Promise((resolve) => {
      const stoken = this.urlToToSharingToken(url);
      this.microsoftLoginService.msGraphService.client
        .api("/shares/" + stoken + "/driveItem")
        .get()
        .then((res) => {
          resolve(res["@microsoft.graph.downloadUrl"]);
        })
        .catch((err) => {
          console.warn(err);
          //reject(err);
          resolve(MICROSOFT_AUTH_ERROR);
        });
    });
  }
}
