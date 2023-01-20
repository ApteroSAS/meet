import {
  pinEntity,
  spawnMedia,
  unpinEntity
} from "../../HubsBridge/utils/Media";
import { ObjectContentOrigins } from "../../../../object-types";
import { ActionAnimationController } from "./ActionAnimationController";
import { roomController } from "./RoomController";
import { mediaViewEventEmitter } from "../service/ChangeVideoService";
import axios from "axios";
import { networkService } from "../../HubsBridge/service/NetworkService";

export class CustomActionRegister {
  actions = {};
  triggers = {};

  constructor() {
    this.actionAnimationController = new ActionAnimationController();
  }

  async triggerAction(id, data) {
    let actionData = this.actions[id];
    if (actionData) {
      if (actionData.action.type === "animation") {
        actionData.callback();
        networkService.sendMessage("animation_play", { id });
      } else if (actionData.action.type === "spawn_attach") {
        let entry = this.convertToEntry(id, data);
        await this.spawnAttach(actionData, entry);
      } else if (actionData.action.type === "remove_from_media_frame") {
        await this.removeFromMediaFrame(actionData);
      } else if (actionData.action.type === "spawn") {
        let entry = this.convertToEntry(id, data);
        await this.handleEntry(entry,this.getMediaOptionSetting(actionData));
      } else if (actionData.action.type === "url") {
        this.url(actionData);
      } else if (actionData.action.type === "room") {
        //deprecated
        if (actionData.action.entry_mode) {
          console.log("entry mode set to ", actionData.action.entry_mode);
          roomController.setEntryMode(actionData.action.entry_mode);
        }
      } else if(actionData.action.type === "sidebar_iframe" ){
        AFRAME.scenes[0].emit("action_toggle_custom_sidebar");
        setTimeout(()=>{AFRAME.scenes[0].emit("action_toggle_custom_sidebar_info",actionData.action)},0);
      }
    }
  }

  async start() {
    this.actionAnimationController.init();
  }

  setup(htmlElement, action, actionid) {
    if (action.type === "animation") {
      this.actionAnimationController.setup(htmlElement, action, actionid);
    }else {
      this.actions[actionid] = { action: action };
    }
  }

  actionExist(actionid){
    return !!this.actions[actionid];
  }

  async handleEntry(entry, mediaOptions = null) {
    return new Promise((resolve, reject) => {
      if (entry.camera || entry.shareScreen) {
        let entityResult = null;
        let onCreate = (data) => {
          let {entity,orientation} = spawnMedia(data.src, ObjectContentOrigins.URL, mediaOptions);
          entityResult = entity;
          resolve({entity,orientation});
        };
        AFRAME.scenes[0].addEventListener("action_end_video_sharing", () => {
          if(entityResult) {
            if (entityResult.parentNode) {
              entityResult.parentNode.removeChild(entityResult);
            }
          }else{
            reject("premature end of share screen/camera");
            mediaViewEventEmitter.removeListener("share_video_media_stream_created", onCreate)
          }
        }, { once: true });
        mediaViewEventEmitter.once("share_video_media_stream_created",onCreate );
      } else {
        resolve(spawnMedia(entry.url, entry.contentOrigin, mediaOptions));
      }
    });
  }

  getMediaOptionSetting(actionData) {
    if(actionData && actionData.action && actionData.action.audio) {
      return {
        distanceModel: actionData.action.audio.distanceModel,
        rolloffFactor: actionData.action.audio.rolloffFactor,
        refDistance: actionData.action.audio.refDistance,
        maxDistance: actionData.action.audio.maxDistance,
        coneInnerAngle: actionData.action.audio.coneInnerAngle,
        coneOuterAngle: actionData.action.audio.coneOuterAngle,
        coneOuterGain: actionData.action.audio.coneOuterGain
      };
    }else{
      return null;
    }
  }

  async convertToNetEntity(entity) {
    return new Promise(async (resolve) => {
      NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
        if (!NAF.utils.isMine(networkedEl)) {
          NAF.utils.takeOwnership(networkedEl);
        }
        resolve(networkedEl);
      });
    });
  }

  onReady(entity, callback) {
    //if (entity.getObject3D("mesh") && entity.getObject3D("mesh").scale) {
    //  callback();
    //} else {
      let promises = [];
      promises.push(new Promise((resolve) => {
        entity.addEventListener("media-loaded", resolve);
      }));
      if(entity.components["media-video"]) {
        promises.push(new Promise((resolve) => {
          entity.addEventListener("video-loaded", resolve);
        }));
      }
      const timeout = new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });
      Promise.race([Promise.all(promises),timeout]).then(() => {
        callback();
      });
    //}
  }

  async waitForNetworkEl(el) {
    const startMs = new Date().getTime();
    return new Promise((resolve,reject) => {
      if (NAF.utils.isMine(el) || NAF.utils.takeOwnership(el)) {
        resolve();
      } else {
        if(new Date().getTime() > (startMs + 60*1000)){
          reject("timeout 60s for waitForNetworkEl");
          return;
        }
        setTimeout(async () => {
          if (!NAF.utils.isMine(el) || NAF.utils.takeOwnership(el)) {
            await this.waitForNetworkEl(el);
            resolve();
          }
        }, 200);
      }
    });
  }

  async spawnAttach(actionData, entry) {
    let mediaFrame = await this.findMediaFrameByName(actionData.action.mediaFrame);
    if (mediaFrame && mediaFrame.components["media-frame"]) {
      let mediaFrameComponent = mediaFrame.components["media-frame"];
      const mfvWorldPos = new THREE.Vector3();
      mediaFrameComponent.el.object3D.getWorldPosition(mfvWorldPos);
      await this.removeOldMediaFrameEntity(mediaFrame);
      let entity = await new Promise(async (resolve, reject) => {
        try {
          let {entity,orientation} = await this.handleEntry(entry,this.getMediaOptionSetting(actionData));
          entity.object3D.position.copy(mfvWorldPos);
          setTimeout(()=>{
            //NOTE: THIS is a hack. We have seen that in case there is a lot of lags the screen can be misplaced initialy. so we set the position again after some time as a fail safe
            const worldQuat = new THREE.Quaternion();
            if(mediaFrameComponent.object3D) {
              entity.object3D.position.copy(mfvWorldPos);
              mediaFrameComponent.object3D.getWorldQuaternion(worldQuat);
              entity.object3D.setRotationFromQuaternion(worldQuat);
              entity.object3D.updateWorldMatrix(true);
            }
          },1000);
          orientation.then(()=>{
            const worldQuat = new THREE.Quaternion();
            if(mediaFrameComponent.object3D) {//TODO is this a bug? in which case this is undefined?
              entity.object3D.position.copy(mfvWorldPos);
              mediaFrameComponent.object3D.getWorldQuaternion(worldQuat);
              entity.object3D.setRotationFromQuaternion(worldQuat);
              entity.object3D.updateWorldMatrix(true);
            }
          });
          entity = await this.convertToNetEntity(entity);
          //this.applyAudio(entity, actionData);
          resolve(entity);
        } catch (e) {
          reject(e);
        }
      });

      if (entity.components["media-video"] && entity.components["media-video"].data.src.startsWith("hubs://")) {
        entity.setAttribute("stop-share-screen-on-destroy", { target: NAF.clientId });
      }
      entity.setAttribute("release-media-frame-on-destroy", { target: actionData.action.mediaFrame });

      if(actionData.action.attribute) {
        Object.keys(actionData.action.attribute).forEach(att => {// eg "forbidden-to-move"
          entity.setAttribute(att, actionData.action.attribute[att]);
        })
      }

      this.onReady(entity, async () => {
        setTimeout(async () => {
          //apply scale to disable mediaframe old scale?
          /*capturableEntity.object3D.scale.setScalar(
            scaleForAspectFit(this.data.bounds, capturableEntity.getObject3D("mesh").scale)
          );*/
          await this.waitForNetworkEl(mediaFrameComponent.el);
          //NAF.entities.completeSync(NAF.clientId,true);
          mediaFrameComponent.capture(entity);
          if (actionData.action.pin) {
            await pinEntity(entity);
          }
          //applyPersistentSync(entity.components["networked"].data.networkId);//TODO usefull?
          //applyPersistentSync(mediaFrame.components["networked"].data.networkId);//TODO usefull?
        }, 0);
      });
    } else {
      console.error("invalid media frame target");
    }
  }

  async removeOldMediaFrameEntity(mediaFrame) {
    return new Promise(async (resolve, reject) => {
      if (mediaFrame && mediaFrame.components["media-frame"]) {
        let mediaFrameComponent = mediaFrame.components["media-frame"];
        //1 find the element to remove
        let capturedEl = document.getElementById(mediaFrameComponent.data.targetId);
        const bodyUUID = mediaFrameComponent.el.components["body-helper"].uuid;
        const mediaFrameSystem = AFRAME.scenes[0].systems["hubs-systems"].mediaFramesSystem;
        const physicalyPresentInMediaFrameEl = mediaFrameSystem.getCapturableEntityCollidingWithBody(mediaFrameComponent.data.mediaType, bodyUUID);//physicaly present but not linked
        capturedEl = capturedEl || physicalyPresentInMediaFrameEl;

        //2 release the element just in case
        if(mediaFrameComponent.data.targetId !== "empty") {
          mediaFrameComponent.release();
        }

        if (capturedEl) {
          //1.1 stop sharing
          const scene = capturedEl.sceneEl;
          if (capturedEl.components["media-video"] && capturedEl.components["media-video"].data.src.startsWith("hubs://")) {
            //hubs:// is the protocole for sharescreen and webcam media
            scene.emit("action_end_video_sharing");
          }
          //removeNetworkedObject(capturedEl.sceneEl, capturedEl);
          //3 destroy the element
          NAF.utils.getNetworkedEntity(capturedEl).then(async networkedEl => {
            if (!NAF.utils.isMine(networkedEl)) {
              NAF.utils.takeOwnership(networkedEl);
            }
            //unpin
            if (!capturedEl.components["media-video"].data.src.startsWith("hubs://")) {
              await unpinEntity(networkedEl);
            }
            //start remove animation
            networkedEl.setAttribute("animation__remove", {
              property: "scale",
              dur: 200,
              to: { x: 0.01, y: 0.01, z: 0.01 },
              easing: "easeInQuad"
            });
            const promise1 = new Promise((resolve2) => {
              networkedEl.addEventListener("animationcomplete", () => {
                if (networkedEl.parentNode) {
                  networkedEl.parentNode.removeChild(networkedEl);
                }
                resolve2();
              });
            });
            const promise2 = new Promise((resolve2) => {
              setTimeout(resolve2, 1000);
            });
            Promise.race([promise1, promise2]).then(() => {
              resolve();
            });
          }).catch(() => {
            capturedEl.parentNode.removeChild(capturedEl);
            resolve();
          }).catch(() => {
            capturedEl.remove();
            resolve();
          });
        } else {
          resolve();
        }
      } else {
        console.error("invalid media frame target");
        reject();
      }
    });
  }

  async findMediaFrameByName(name) {
    return new Promise((resolve) => {
      let mediaFrame = null;
      Object.keys(NAF.entities.entities).forEach(key => {
        let frame = NAF.entities.entities[key];
        if (frame.className === name) {
          mediaFrame = frame;
        }
      });
      resolve(mediaFrame);
    });
  }

  async removeFromMediaFrame(actionData) {
    let mediaFrame = await this.findMediaFrameByName(actionData.action.mediaFrame);
    await this.removeOldMediaFrameEntity(mediaFrame);
  }

  async url(actionData) {
    if (actionData.action.mode) {
      switch (actionData.action.mode) {
        case "change":
          window.location.href = actionData.action.url;
          break;
        case "rest_get":
          axios.get(actionData.action.url, actionData.action.config).then(resp => {
            console.log(resp.data);
          }).catch(reason => {
            console.error(reason);
          });
          break;
        case "rest_post":
          axios.post(actionData.action.url, actionData.action.data, actionData.action.config).then(resp => {
            console.log(resp.data);
          }).catch(reason => {
            console.error(reason);
          });
          break;
        default:
          window.open(actionData.action.url, "_blank");
      }
    } else {
      //default new_page
      window.open(actionData.action.url, "_blank");
    }
  }

  convertToEntry(id, data) {
    let actionData = this.actions[id];
    let entry;
    if (data && (data.camera || data.shareScreen)) {
      entry = data;
    } else {
      actionData.action.url = actionData.action.url || "";
      if (actionData.action.url.indexOf("$trigger.url") !== -1) {
        actionData.action.url = actionData.action.url.replace("$trigger.url", data.url);
      }
      entry = {
        url: actionData.action.url,
        contentOrigin: ObjectContentOrigins.URL
      };
    }
    return entry;
  }

}

export const customActionRegister = new CustomActionRegister();
