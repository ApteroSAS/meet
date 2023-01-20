import { MicrosoftLoginService } from "./MicrosoftLoginService";
export declare class MicrosoftUrlService {
    private microsoftLoginService;
    preloaded: {};
    constructor(microsoftLoginService: MicrosoftLoginService);
    urlToToSharingToken(url: any): string;
    preFetchConvertMicrosoftUrl(url: any): Promise<any>;
    convertMicrosoftUrlSync(url: any): any;
    convertMicrosoftUrl(url: any): Promise<any>;
    convertSharingUrlToDownloadUrl(url: any): Promise<unknown>;
}
