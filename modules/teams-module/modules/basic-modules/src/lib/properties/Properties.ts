import { IService } from "@aptero/axolotis-player";
declare const window;

export class Properties implements IService {
  getType(): string {
    return Properties.name;
  }

  getGlobalProperties<T>(): T {
    if (typeof window !== "undefined") {
      return window.APP_PROPS || {};
    } else {
      return {} as T;
    }
  }

  get<T>(key: string): T {
    return this.getGlobalProperties()[key] as T;
  }
}
