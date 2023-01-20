import axios from "axios";
import { COOKIE_STORE_SERVICE, NAME_SERVICE, PHX_AUTH_SERVICE, PROPERTIES_SERVICE, STORE_SERVICE } from "@root/index";
import { PropertiesFormat, PROPERTY_KEY } from "@root/roomAPI/PropertiesFormat";
import { IService, IServices, Service } from "@aptero/axolotis-player";
import { createHubChannelParams } from "./hub-utils";

import { Properties } from "@root/properties/Properties";
import { NameGenerationService } from "@root/nameGeneration/NameGenerationService";
import { Store } from "@root/store/Store";
import { PhoenixAuthService } from "@root/phoenixAuth/PhoenixAuthService";
import { CookieStore } from "@root/store/CookieStore";
import { config } from "@root/phoenixAuth/phoenix-utils";

declare const window;

export class RoomServiceFactory implements Service<RoomService> {
  async createService(services: IServices): Promise<RoomService> {
    return new RoomService(
      await services.getService<PhoenixAuthService>(PHX_AUTH_SERVICE),
      await services.getService<Store>(STORE_SERVICE),
      await services.getService<Properties>(PROPERTIES_SERVICE),
      await services.getService<NameGenerationService>(NAME_SERVICE),
      await services.getService<CookieStore>(COOKIE_STORE_SERVICE)
    );
  }
}

export class RoomService implements IService {
  public static dependencies: string[] = [PHX_AUTH_SERVICE, STORE_SERVICE, PROPERTIES_SERVICE, NAME_SERVICE, COOKIE_STORE_SERVICE];

  constructor(
    private phoenixAuthService: PhoenixAuthService,
    private store: Store,
    private properties: Properties,
    private nameService: NameGenerationService,
    private cookie: CookieStore
  ) {}

  getType(): string {
    return RoomService.name;
  }

  parseUrl(url) {
    //https://alphahub.aptero.co/fTj63Hg/room?msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8
    let urlObj = new URL(url);

    if (urlObj.origin.startsWith("https://localhost")) {
      return {
        origin: urlObj.origin,
        roomSID: urlObj.searchParams.get("hub_id"),
      };
    } else {
      return {
        origin: urlObj.origin,
        roomSID: urlObj.pathname.split("/")[1],
      };
    }
  }

  createAndRedirectToNewHub(a, b, c) {
    return this.phoenixAuthService.createAndRedirectToNewHub(a, b, c);
  }

  async getLinkFromCode(code: string) {
    const url = "https://" + config().RETICULUM_SERVER + "/link/" + code;
    const res = await fetch(url);
    console.log(res);
    console.log(res.headers.get("location"));
    if (res.status >= 400) {
      console.error(res);
      throw new Error("wrong status");
    } else {
      return res.headers.get("location");
    }
  }

  async getEmbedToken(roomSID, origin) {
    if (window.location.origin.startsWith("https://localhost")) {
      let conf = this.properties.get<PropertiesFormat>(PROPERTY_KEY);
      origin = conf.ROOM_TOKEN_SERVICE || window.location.origin;
    }
    let res = await axios.get(origin + "/service/room/" + "room/" + roomSID + "/embed/token");
    return res.data;
  }

  fetchSpokeProject(userId) {
    return (cursor) => {
      if (userId) {
        //https://alphahub.aptero.co/api/v1/media/search?filter=my-scenes&source=scenes&user=640407050966269961
        return this.phoenixAuthService.fetchReticulumAuthenticated(`/api/v1/media/search?filter=my-scenes&source=scenes&user=${userId}&cursor=${cursor}`);
      } else {
        return Promise.reject(new Error("Not signed in"));
      }
    };
  }

  fetchFavoriteRoom(userId) {
    return (cursor) => {
      if (userId) {
        return this.phoenixAuthService.fetchReticulumAuthenticated(`/api/v1/media/search?source=favorites&type=rooms&user=${userId}&cursor=${cursor}`);
      } else {
        return Promise.reject(new Error("Not signed in"));
      }
    };
  }

  async setFavorite(hubId) {
    if (!this.store.state.credentials.token) {
      //the user is not logged in so we cannot set favourite
      return;
    }
    const socket = await this.phoenixAuthService.connectToReticulum(false);
    socket.onClose(() => {});
    // Reticulum global channel
    window.APP.retChannel = socket.channel(`ret`, { hub_id: hubId });
    this.phoenixAuthService.setGlobalReticulumChannel(window.APP.retChannel);
    window.APP.retChannel
      .join()
      .receive("ok", () => {
        const OAUTH_FLOW_PERMS_TOKEN_KEY = "ret-oauth-flow-perms-token";
        const oauthFlowPermsToken = this.cookie.get(OAUTH_FLOW_PERMS_TOKEN_KEY);
        if (oauthFlowPermsToken) {
          this.cookie.remove(OAUTH_FLOW_PERMS_TOKEN_KEY);
        }
        const hubChannelParamsForPermsToken = (permsToken) => {
          return createHubChannelParams({
            profile: this.store.state.profile,
            pushSubscriptionEndpoint: null,
            permsToken,
            isMobile: false,
            isMobileVR: false,
            isEmbed: false,
            hubInviteId: null,
            authToken: this.store.state.credentials && this.store.state.credentials.token,
          });
        };
        const hubPhxChannel = socket.channel(`hub:${hubId}`, hubChannelParamsForPermsToken(oauthFlowPermsToken));
        hubPhxChannel
          .join()
          .receive("ok", async () => {
            hubPhxChannel.push("favorite", {});
          })
          .receive("error", (res) => {
            console.error(res);
          });
      })
      .receive("error", (res) => {
        console.error(res);
      });
  }

  async createAndSelect(sceneId, name = undefined) {
    const createUrl = this.phoenixAuthService.getReticulumFetchUrl("/api/v1/hubs");
    const payload: any = { hub: { name: name || this.nameService.generateHubName() } };

    if (sceneId) {
      payload.hub.scene_id = sceneId;
    }

    const headers: any = { "content-type": "application/json" };
    const store = this.store;
    if (store.state && store.state.credentials.token) {
      headers.authorization = `bearer ${store.state.credentials.token}`;
    }

    let res = await fetch(createUrl, {
      body: JSON.stringify(payload),
      headers,
      method: "POST",
    }).then((r) => r.json());

    if (res.error === "invalid_token") {
      // Clear the invalid token from store.
      store.update({ credentials: { token: null, email: null } });

      // Create hub anonymously
      delete headers.authorization;
      res = await fetch(createUrl, {
        body: JSON.stringify(payload),
        headers,
        method: "POST",
      }).then((r) => r.json());
    }

    const hub = res;
    let url = hub.url;

    /*const creatorAssignmentToken = hub.creator_assignment_token;
        if (creatorAssignmentToken) {
          store.update({ creatorAssignmentTokens: [{ hubId: hub.hub_id, creatorAssignmentToken: creatorAssignmentToken }] });

          // Don't need to store the embed token if there's no creator assignment token, since that means
          // we are the owner and will get the embed token on page load.
          const embedToken = hub.embed_token;

          if (embedToken) {
            store.update({ embedTokens: [{ hubId: hub.hub_id, embedToken: embedToken }] });
          }
        }*/

    if (this.phoenixAuthService.isLocalClient()) {
      url = window.location.origin + `/hub.html?hub_id=${hub.hub_id}`;
    }
    this.setFavorite(hub.hub_id);
    return url;
  }

  createRoomEntry(name, sceneid, imageUrl) {
    return {
      allow_remixing: false,
      attributions: {
        content: [
          {
            title: "Salle",
          },
          {
            title: "Image",
          },
          {
            title: "Image 1",
          },
          {
            title: "Video",
          },
        ],
        creator: "",
      },
      description: null,
      id: sceneid, //"EW4e3CG"
      images: {
        preview: {
          url: imageUrl, //"https://alphahub.aptero.co/files/cb50c02d-585a-4feb-8461-e6d8cd34b656.jpg"
        },
      },
      name: name,
      project_id: "XXXXX",
      type: "scene",
      url: window.location.origin + "/" + sceneid,
    };
  }
}
