import { AdminRole } from "./AdminRole";
import AuthChannel from "./auth-channel";
import { IService, IServices, Service } from "@aptero/axolotis-player";
import { AuthInterface } from "../common/AuthInterface";
import { MsToNativeLoginBridge } from "./MsToNativeLoginBridge";
export declare class PhoenixAuthServiceFactory implements Service<PhoenixAuthService> {
    createService(services: IServices): Promise<PhoenixAuthService>;
}
export declare class PhoenixAuthService implements IService {
    adminRole: AdminRole;
    nativeBridge: MsToNativeLoginBridge;
    private ret;
    getNativeInterface(): MsToNativeLoginBridge;
    setGlobalReticulumChannel(ret: any): void;
    getGlobalReticulumChannel(ret: any): any;
    registerAuth(auth: AuthInterface): void;
    getAdmin(): AdminRole;
    connectToReticulum(debug?: boolean, params?: any, socketClass?: any): Promise<any>;
    createAuthChannel(store: any): AuthChannel;
    getType(): string;
    createAndRedirectToNewHub(name: any, sceneId: any, replace: any): Promise<void>;
    getReticulumFetchUrl(path: any, absolute?: boolean, host?: any, port?: any): any;
    fetchReticulumAuthenticated(url: any, method?: string, payload?: any): Promise<any>;
    isLocalClient(): boolean;
}
