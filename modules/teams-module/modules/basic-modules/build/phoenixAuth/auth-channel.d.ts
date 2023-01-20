export default class AuthChannel {
    private store;
    private socket;
    _signedIn: any;
    constructor(store: any);
    setSocket: (socket: any) => void;
    get email(): any;
    get signedIn(): any;
    signOut: (hubChannel: any) => Promise<void>;
    verifyAuthentication(authTopic: any, authToken: any, authPayload: any): Promise<unknown>;
    startAuthentication(email: any, hubChannel: any): Promise<{
        authComplete: Promise<unknown>;
    }>;
    handleAuthCredentials(email: any, token: any, hubChannel: any): Promise<void>;
}
