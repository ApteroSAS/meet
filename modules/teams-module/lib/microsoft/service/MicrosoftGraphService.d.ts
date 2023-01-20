import { Client } from "@microsoft/microsoft-graph-client";
export declare class MicrosoftGraphService {
    client: Client;
    init(client: any): void;
    isInitialized(): Client;
    getUserDetails(): Promise<any>;
    getUserDetailsBetaV(): Promise<any>;
    getUserOrganization(): Promise<any>;
    blobToBase64(blob: any): Promise<string>;
    getUserPhotoAsBase64(): Promise<string>;
}
