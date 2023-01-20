import { propertiesService } from "../properties/propertiesService";
import axios from "axios";

export class RemoteControlServiceV2 {
  remoteScreenSessionIdMap = {};
  remoteScreenSessionRfbMap = {};
  lastMoveTime = 0;
  screenSize = {};
  lastX = 0;
  lastY = 0;
  lastSessionID = "";

  async start() {
    setInterval(() => {
      try {
        //send all heart beat
        Object.keys(this.remoteScreenSessionRfbMap).forEach(async sid => {
          await axios.get(
            propertiesService.PROTOCOL +
              propertiesService.REMOTE_VM_SERVICE.url +
              "/service/remote/orchestrator/heart/beat/" +
              sid
          );
        });
      } catch (e) {
        console.warn(e);
        /* do not throw error for heart beat log only*/
      }
    }, 5 * 60 * 1000);
  }

  getNewRemoteSessionID() {
    return window.APP.store.credentialsAccountId
      ? window.APP.store.credentialsAccountId
      : "anonymous" + Math.floor(Math.random() * 10000000);
  }

  async generateFallBackUrl(urlToProxy, userId) {
    urlToProxy = urlToProxy || window.location.href;
    let theURL = new URL("https://meet.aptero.co/service/remote/orchestrator/static/app/embed-app-v2.html");
    theURL.searchParams.set("q", btoa(urlToProxy));
    theURL.searchParams.set("u", userId || this.getNewRemoteSessionID());
    return theURL.toString();
  }

  async getScreen(screenElement, data) {
    /*let data = {
            localSessionID: NAFscreenID,
            remoteScreenSessionId: remoteScreenSessionId,
            screenSizeX:width,
            screenSizeY:height,
            metaData:metaData
        }*/
    let password = null;
    try {
      password = data.metaData.imageParams.PASSWORD;
    } catch (er) {
      /* ignore error */
    }
    this.screenSize[data.remoteScreenSessionId] = {
      width: data.screenSizeX,
      height: data.screenSizeY
    };
    this.remoteScreenSessionIdMap[data.localSessionID] = data.remoteScreenSessionId;
    return new Promise((resolve, reject) => {
      axios
        .post(
          propertiesService.PROTOCOL + propertiesService.REMOTE_VM_SERVICE.url + "/service/remote/orchestrator/create",
          data
        )
        .then(async resp => {
          resp = resp.data;
          resp.url =
            "wss://" +
            propertiesService.REMOTE_VM_SERVICE.url +
            "/reverse/" +
            resp.ip +
            "/" +
            resp.port +
            "/websockify";
          const rfb = await this.createRBF(screenElement.children[0], resp.url, {
            credentials: { password: password }
          });
          this.remoteScreenSessionRfbMap[data.remoteScreenSessionId] = rfb;
          resolve(rfb);
        })
        .catch(reason => {
          reject(reason);
        });
    });
  }

  async createRBF(el, url, options) {
    const RFB = (await import("@novnc/novnc/core/rfb")).default;
    const rfb = new RFB(el, url, options);
    await new Promise((resolve, reject) => {
      let desktopName = "ERROR";
      rfb.addEventListener("connect", () => {
        console.log("Connected to " + desktopName);
        resolve(desktopName);
      });
      rfb.addEventListener("disconnect", e => {
        if (e.detail.clean) {
          console.log("Disconnected");
          //connection lost but url still here try to reconnect
        } else {
          reject("Something went wrong");
          console.error("Something went wrong, connection is closed", e);
        }
      });
      rfb.addEventListener("credentialsrequired", e => {
        const password = prompt("Password Required:");
        rfb.sendCredentials({ password: password });
      });
      rfb.addEventListener("desktopname", e => {
        desktopName = e.detail.name;
      });
    });
    return rfb;
  }

  registerEventOnElement(el) {
    el.object3D.addEventListener("interact", this.onInteract);
    el.object3D.addEventListener("hovered", () => {
      console.log("hovered");
    });
    el.object3D.addEventListener("unhovered", () => {
      console.log("unhovered");
    });
  }

  onInteract = e => {
    //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    this.remoteScreenSessionRfbMap[this.lastSessionID]._handleMouseButton(this.lastX, this.lastY, true, 1);
    this.remoteScreenSessionRfbMap[this.lastSessionID]._handleMouseButton(this.lastX, this.lastY, false, 1);
  };

  updateCursorPosition(remoteScreenSessionId, mouseRatioX, mouseRatioY) {
    this.lastSessionID = remoteScreenSessionId;
    if (this.remoteScreenSessionRfbMap[remoteScreenSessionId]) {
      let mouseX = this.screenSize[remoteScreenSessionId].width * mouseRatioX;
      let mouseY = this.screenSize[remoteScreenSessionId].height * (mouseRatioY - 1) * -1;
      this.lastX = mouseX;
      this.lastY = mouseY;
      this.remoteScreenSessionRfbMap[remoteScreenSessionId]._handleMouseMove(mouseX, mouseY);
    }
  }

  tryCaptureCursor(intersection) {
    if (intersection) {
      if (intersection?.object?.el?.components["media-video"]?.el === intersection?.object?.el) {
        // check type of object
        NAF.utils.getNetworkedEntity(intersection.object.el).then(networkedEl => {
          let screenId = networkedEl.components.networked.data.networkId; // id screen
          if (this.remoteScreenSessionIdMap[screenId]) {
            if (new Date().getTime() - this.lastMoveTime < 50) {
              return;
            }
            this.lastMoveTime = new Date().getTime();
            let mouseRatioX = intersection?.uv?.x;
            let mouseRatioY = intersection?.uv?.y;
            this.updateCursorPosition(this.remoteScreenSessionIdMap[screenId], mouseRatioX, mouseRatioY);
          }
        });
      }
    }
  }
}

export const remoteControlServiceV2 = new RemoteControlServiceV2();
