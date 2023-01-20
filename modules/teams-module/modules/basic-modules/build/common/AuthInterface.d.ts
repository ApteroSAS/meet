export interface AuthInterface {
    getAccount(): {
        email: any;
        displayName: any;
        id: any;
    };
    passiveLogIn(): Promise<void>;
    signOut(): Promise<void>;
    signIn(): Promise<void>;
}
