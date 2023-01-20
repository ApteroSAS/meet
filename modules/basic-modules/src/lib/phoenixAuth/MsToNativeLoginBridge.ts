import uuid from "uuid/v4";
import AuthChannel from "./auth-channel";
import { connectToReticulum } from "./phoenix-utils";
declare const window;

//TODO here we will need an interface Auth
export class MsToNativeLoginBridge {
  isLogged() {
    try {
      return !!window.APP.store.state.credentials.token;
    } catch (e) {
      return false;
    }
  }

  clearProfile() {
    window.APP.store.update({
      profile: {
        phoneNumber: null,
        displayName: "Teams Guest",
        email: null,
        jobTitle: null,
        companyName: null,
        microsoftUserprofilePicture: null,
        microsoftUser: null,
      },
      activity: { hasChangedName: false, hasChangedPicture: false },
    });
  }

  async logout() {
    if (window.APP.hubChannel) {
      await window.APP.hubChannel.signOut(window.APP.hubChannel);
      console.log("Native signOut");
    }
    window.APP.store.update({ credentials: { token: null, email: null } });
    await this.clearProfile();
  }

  /*{
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.mobilePhone,
        jobTitle: user.jobTitle,
        companyName: this.organization,
        microsoftUserprofilePicture: this.profilePicture,
        microsoftUser: user.id
      }*/
  async setProfile(profile) {
    window.APP.store.update({
      profile: profile,
      activity: { hasChangedName: true, hasChangedPicture: true },
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    }); //await store.update()
  }
  async setCredential(email, token) {
    window.APP.store.update({
      credentials: { email, token },
      activity: { hasChangedName: false, hasChangedPicture: false },
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    }); //await store.update()
    if (window.APP.hubChannel) {
      await window.APP.hubChannel.signIn(token);
      console.log("Native Sign In : " + token);
    }
  }

  getUserAccount() {
    return this.getProfile();
  }

  getName() {
    return window.APP.store.profile.displayName;
  }

  displayProfilePhoto() {
    return this.getProfile().microsoftUserprofilePicture;
  }

  getProfile() {
    return window.APP.store.state.profile || {};
  }

  async nativeLogin(email, accessToken) {
    if (window.APP.store.state.credentials.token) {
      return;
    }
    const hubChannel: any = new AuthChannel(window.APP.store);
    const socket = await connectToReticulum();
    hubChannel.setSocket(socket);

    //const email = user.accountIdentifier + "_" + user.userName+ "_microsoft";
    await new Promise((resolve, reject) => {
      const channel = hubChannel.socket.channel(`auth:${uuid()}`);
      channel.onError(() => {
        channel.leave();
        reject();
      });
      channel
        .join()
        .receive("ok", () => {
          channel.on("auth_token_resp", async ({ auth_token: auth_token, auth_payload: auth_payload }) => {
            channel.on("auth_credentials", async ({ credentials: token, payload: payload }) => {
              await this.setCredential(payload.email, token);
              resolve(true);
            });
            channel.push("auth_verified", {
              token: auth_token,
              payload: auth_payload,
            });
          });
          //TODO security ensure we always send acces token
          if (!accessToken || !email) {
            reject(new Error());
          }
          channel.push("auth_token_request", {
            email,
            authtoken: accessToken,
            origin: "hubs",
          });
        })
        .receive("error", reject);
    });
  }
}
