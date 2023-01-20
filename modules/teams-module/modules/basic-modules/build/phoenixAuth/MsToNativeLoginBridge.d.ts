export declare class MsToNativeLoginBridge {
    isLogged(): boolean;
    clearProfile(): void;
    logout(): Promise<void>;
    setProfile(profile: any): Promise<void>;
    setCredential(email: any, token: any): Promise<void>;
    getUserAccount(): any;
    getName(): any;
    displayProfilePhoto(): any;
    getProfile(): any;
    nativeLogin(email: any, accessToken: any): Promise<void>;
}
