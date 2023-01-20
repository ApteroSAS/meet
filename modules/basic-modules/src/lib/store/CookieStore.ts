import { IService } from "@aptero/axolotis-player";

export class CookieStore implements IService {
  getType(): string {
    return CookieStore.name;
  }

  get(key: string) {
    return localStorage.getItem(key);
  }

  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  remove(key: string) {
    return localStorage.removeItem(key);
  }
}
