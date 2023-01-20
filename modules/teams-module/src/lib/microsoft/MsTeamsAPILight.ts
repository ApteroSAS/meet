import { getService, IService } from "@aptero/axolotis-player";
import type { MsTeamsAPI } from "@root/lib/microsoft/MsTeamsAPI";
export const MICROSOFT_AUTH_ERROR = "error_microsoft_not_authorized";
export const MSTEAMS_QUERY_PARAM = "msteams";

export const MICROSOFT_SERVICE = "@aptero/axolotis-module-teams/MicrosoftService";

//msTeamsAPI
export async function msTeamsAPI(): Promise<MsTeamsAPI> {
  return getService<MsTeamsAPI>(MICROSOFT_SERVICE);
}

declare const window;

/**
 * aims of this class is to perform siple check to see if we need to load the complet MsTeams Bundle with its
 * dependencies. Thus this module should be lightweight and not import big library.
 */
export class MsTeamsAPILight implements IService {
  private msmode: boolean;

  constructor() {
    const qs = new URLSearchParams(location.search);
    this.msmode = !!qs.get(MSTEAMS_QUERY_PARAM);
    if (this.msmode && (window.location.host.startsWith("localhost") || window.location.host.startsWith("127.0.0.1"))) {
      (async () => {
        (await msTeamsAPI()).registerTeamsTestHelper();
      })();
    }
  }

  getType(): string {
    return MsTeamsAPILight.name;
  }

  msTeams() {
    return this.msmode;
  }

  redirectToTeamsSidePanel() {
    if (this.msTeams()) {
      msTeamsAPI().then(async (service) => {
        await service.redirectToTeamsSidePanel();
      });
    }
  }

  private msPassiveLoginCheckNeeded() {
    return window.APP.store.state.profile.microsoftUser || this.msTeams();
  }

  async preFetchConvertMicrosoftUrl(url) {
    if (url.indexOf("sharepoint.com") === -1) {
      let urlService = (await msTeamsAPI()).getUrlService();
      url = await urlService.preFetchConvertMicrosoftUrl(url);
    }
    return url;
  }

  async conditionalPassiveLogIn(): Promise<boolean> {
    if (this.msPassiveLoginCheckNeeded()) {
      let service = await msTeamsAPI();
      await service.getLoginService().passiveLogin();
      return true;
    } else {
      return false;
    }
  }
}
