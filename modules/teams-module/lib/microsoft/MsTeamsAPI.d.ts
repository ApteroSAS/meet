import { Component, IServices, Service } from "@aptero/axolotis-player";
import { MicrosoftLoginService } from "./service/MicrosoftLoginService";
import "../aptTeamsApp/TeamsTestHelper";
import { app, pages } from "@microsoft/teams-js";
import { PhoenixAuthService } from "@aptero/axolotis-module-basic";
import { MicrosoftUrlService } from "./service/MicrosoftUrlService";
export declare class MsTeamsAPIFactory implements Service<MsTeamsAPI> {
    createService(services: IServices): Promise<MsTeamsAPI>;
}
export declare class MsTeamsAPI implements Component {
    private phxAuth;
    private microsoftLoginService;
    private microsoftUrlService;
    static dependencies: string[];
    constructor(phxAuth: PhoenixAuthService);
    getLoginService(): MicrosoftLoginService;
    getTeamsApp(): {
        app: typeof app;
        pages: typeof pages;
    };
    redirectToTeamsSidePanel(): Promise<void>;
    getUrlService(): MicrosoftUrlService;
    getMSEvents(): any;
    getContext(callback: (context: any) => void): Promise<void>;
    processDeepLink(link: string): Promise<void>;
    changeUrlSettings(url: string): void;
    getType(): string;
    registerTeamsTestHelper(): void;
}
