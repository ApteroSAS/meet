import { IService } from "@aptero/axolotis-player";
export declare class CookieStore implements IService {
    getType(): string;
    get(key: string): string;
    set(key: string, value: string): void;
    remove(key: string): void;
}
