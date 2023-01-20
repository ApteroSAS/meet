import { Component, IServices, Service } from "@aptero/axolotis-player";
import { MicrosoftLoginService } from "./service/MicrosoftLoginService";
import { redirectToTeamsSidePanel } from "../aptTeamsApp/RedirectToSidePage";
import { changeUrlSettings, getContext, getMSEvents, processDeepLink } from "../aptTeamsApp/MsTeamsUtils";
import "../aptTeamsApp/TeamsTestHelper";
import { registerTeamsTestHelper } from "../aptTeamsApp/TeamsTestHelper";
import { app, pages } from "@microsoft/teams-js";
import { PhoenixAuthService } from "@aptero/axolotis-module-basic";
import { PHX_AUTH_SERVICE } from "@aptero/axolotis-module-basic";
import { MicrosoftUrlService } from "./service/MicrosoftUrlService";

export class MsTeamsAPIFactory implements Service<MsTeamsAPI> {
  async createService(services: IServices): Promise<MsTeamsAPI> {
    console.log("MsTeamsAPIFactory");
    let service = await services.getService<PhoenixAuthService>(PHX_AUTH_SERVICE);
    return new MsTeamsAPI(service);
  }
}

export class MsTeamsAPI implements Component {
  private microsoftLoginService: MicrosoftLoginService;
  private microsoftUrlService: MicrosoftUrlService;

  public static dependencies: string[] = [PHX_AUTH_SERVICE];

  constructor(private phxAuth: PhoenixAuthService) {
    this.microsoftLoginService = new MicrosoftLoginService(phxAuth.getNativeInterface());
    this.microsoftUrlService = new MicrosoftUrlService(this.microsoftLoginService);
  }

  getLoginService(): MicrosoftLoginService {
    return this.microsoftLoginService;
  }

  getTeamsApp(): { app: typeof app; pages: typeof pages } {
    return { app, pages };
  }

  async redirectToTeamsSidePanel() {
    await redirectToTeamsSidePanel();
  }

  getUrlService() {
    return this.microsoftUrlService;
  }

  getMSEvents() {
    return getMSEvents();
  }

  getContext(callback: (context) => void) {
    return getContext(callback);
  }

  async processDeepLink(link: string) {
    return processDeepLink(link);
  }

  changeUrlSettings(url: string) {
    return changeUrlSettings(url);
  }

  getType(): string {
    return MsTeamsAPI.name;
  }

  registerTeamsTestHelper() {
    return registerTeamsTestHelper();
  }
}
