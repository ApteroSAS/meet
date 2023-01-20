import { AdminRole } from "./AdminRole";
import { connectToReticulum, createAndRedirectToNewHub, fetchReticulumAuthenticated, getReticulumFetchUrl, isLocalClient } from "./phoenix-utils";
import AuthChannel from "./auth-channel";
import { IService, IServices, Service } from "@aptero/axolotis-player";
import { AuthInterface } from "@root/common/AuthInterface";
import { MsToNativeLoginBridge } from "./MsToNativeLoginBridge";

export class PhoenixAuthServiceFactory implements Service<PhoenixAuthService> {
  async createService(services: IServices): Promise<PhoenixAuthService> {
    console.log("PhoenixAuthServiceFactory");
    return new PhoenixAuthService();
  }
}

export class PhoenixAuthService implements IService {
  adminRole = new AdminRole();
  nativeBridge = new MsToNativeLoginBridge();
  private ret: any;

  getNativeInterface() {
    return this.nativeBridge;
  }

  setGlobalReticulumChannel(ret) {
    this.ret = ret;
  }

  getGlobalReticulumChannel(ret) {
    return ret;
  }

  registerAuth(auth: AuthInterface) {
    throw new Error();
  }

  getAdmin() {
    return this.adminRole;
  }

  async connectToReticulum(debug = false, params = null, socketClass = null) {
    return connectToReticulum(debug, params, socketClass);
  }

  createAuthChannel(store) {
    return new AuthChannel(store);
  }

  getType(): string {
    return PhoenixAuthService.name;
  }

  async createAndRedirectToNewHub(name, sceneId, replace) {
    return createAndRedirectToNewHub(name, sceneId, replace);
  }

  getReticulumFetchUrl(path, absolute = false, host = null, port = null) {
    return getReticulumFetchUrl(path, absolute, host, port);
  }

  fetchReticulumAuthenticated(url, method = "GET", payload = null) {
    return fetchReticulumAuthenticated(url, method, payload);
  }

  isLocalClient() {
    return isLocalClient();
  }
}
