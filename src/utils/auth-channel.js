import uuid from "uuid/v4";
import { microsoftService } from "../aptero/service/MicrosoftService";

export default class AuthChannel {
  constructor(store) {
    this.store = store;
    this.socket = null;
    this._signedIn = !!this.store.state.credentials.token;
  }

  setSocket = socket => {
    this.socket = socket;
    let user = microsoftService.getUserAccount();
    if (user) {
      this.convertToHubToken(user).catch((err)=>{
        console.error(err);
      });
    }

    microsoftService.eventEmitter.on("auth", async () => {
      let user = microsoftService.getUserAccount();
      await this.convertToHubToken(user);
      window.location.reload();
    });
    this.syncMicrosoftAccount(null);
  };

  get email() {
    return (microsoftService.getUserAccount() && microsoftService.getUserAccount().name) || this.store.state.credentials.email;
  }

  get signedIn() {
    return this._signedIn;
  }

  async syncMicrosoftAccount(hubChannel) {
    if (this.store.state.credentials.email && this.store.state.credentials.email.endsWith("_microsoft") && !microsoftService.getUserAccount()) {
      //if microsoft account is logged off we log of the aptero account
      //console.log("sign out sync");
      await this.signOut(hubChannel);
      window.location.reload();
    }
  }

  signOut = async hubChannel => {
    if (hubChannel) {
      await hubChannel.signOut();
    }
    this.store.update({ credentials: { token: null, email: null } });
    await this.store.resetToRandomDefaultAvatar();
    this._signedIn = false;
    await microsoftService.logout();
  };

  verifyAuthentication(authTopic, authToken, authPayload) {
    const channel = this.socket.channel(authTopic);
    return new Promise((resolve, reject) => {
      channel.onError(() => {
        channel.leave();
        reject();
      });

      channel
        .join()
        .receive("ok", () => {
          channel.on("auth_credentials", async ({ credentials: token, payload: payload }) => {
            await this.handleAuthCredentials(payload.email, token);
            resolve();
          });

          channel.push("auth_verified", { token: authToken, payload: authPayload });
        })
        .receive("error", reject);
    });
  }

  async convertToHubToken(user) {
    const email = user.accountIdentifier + "_" + user.userName+ "_microsoft";
    const authtoken = user.idToken;
    await new Promise((resolve, reject) => {
      const channel = this.socket.channel(`auth:${uuid()}`);
      channel.onError(() => {
        channel.leave();
        reject();
      });
      channel
        .join()
        .receive("ok", () => {
          channel.on("auth_token_resp", async ({
                                                 auth_token: auth_token,
                                                 auth_payload: auth_payload
                                               }) => {
            channel.on("auth_credentials", async ({ credentials: token, payload: payload }) => {
              await this.handleAuthCredentials(payload.email, token);
              resolve();
            });
            channel.push("auth_verified", { token: auth_token, payload: auth_payload });
          });
          channel.push("auth_token_request", { email, authtoken, origin: "hubs" });
        }).receive("error", reject);
    });
  }

  async startAuthentication(email, hubChannel) {
    const channel = this.socket.channel(`auth:${uuid()}`);
    await new Promise((resolve, reject) =>
      channel
        .join()
        .receive("ok", resolve)
        .receive("error", reject)
    );

    const authComplete = new Promise(resolve =>
      channel.on("auth_credentials", async ({ credentials: token }) => {
        await this.handleAuthCredentials(email, token, hubChannel);
        resolve();
      })
    );

    channel.push("auth_request", { email, origin: "hubs" });

    // Returning an object with the authComplete promise since we want the caller to wait for the above await but not
    // for authComplete.
    return { authComplete };
  }

  async handleAuthCredentials(email, token, hubChannel) {
    this.store.update({ credentials: { email, token } });

    if (hubChannel) {
      await hubChannel.signIn(token);
    }

    this._signedIn = true;
  }
}
