import { IService } from "@aptero/axolotis-player";
export declare class Properties implements IService {
    getType(): string;
    getGlobalProperties<T>(): T;
    get<T>(key: string): T;
}
