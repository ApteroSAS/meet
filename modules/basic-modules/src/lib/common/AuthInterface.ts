export interface AuthInterface {
  getAccount(): { email; displayName; id };
  passiveLogIn(): Promise<void>;
  signOut(): Promise<void>;
  signIn(): Promise<void>;
}
