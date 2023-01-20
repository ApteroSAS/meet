import { IService, IServices, Service } from "@aptero/axolotis-player";
import { Properties } from "../properties/Properties";
import { NameGenerationService } from "../nameGeneration/NameGenerationService";
import { Store } from "../store/Store";
import { PhoenixAuthService } from "../phoenixAuth/PhoenixAuthService";
import { CookieStore } from "../store/CookieStore";
export declare class RoomServiceFactory implements Service<RoomService> {
    createService(services: IServices): Promise<RoomService>;
}
export declare class RoomService implements IService {
    private phoenixAuthService;
    private store;
    private properties;
    private nameService;
    private cookie;
    static dependencies: string[];
    constructor(phoenixAuthService: PhoenixAuthService, store: Store, properties: Properties, nameService: NameGenerationService, cookie: CookieStore);
    getType(): string;
    parseUrl(url: any): {
        origin: string;
        roomSID: string;
    };
    createAndRedirectToNewHub(a: any, b: any, c: any): Promise<void>;
    getLinkFromCode(code: string): Promise<string>;
    getEmbedToken(roomSID: any, origin: any): Promise<any>;
    fetchSpokeProject(userId: any): (cursor: any) => Promise<any>;
    fetchFavoriteRoom(userId: any): (cursor: any) => Promise<any>;
    setFavorite(hubId: any): Promise<void>;
    createAndSelect(sceneId: any, name?: any): Promise<any>;
    createRoomEntry(name: any, sceneid: any, imageUrl: any): {
        allow_remixing: boolean;
        attributions: {
            content: {
                title: string;
            }[];
            creator: string;
        };
        description: any;
        id: any;
        images: {
            preview: {
                url: any;
            };
        };
        name: any;
        project_id: string;
        type: string;
        url: string;
    };
}
