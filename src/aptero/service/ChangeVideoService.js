//import { roomInteractableRemover } from "./RoomInteractableRemover";
import { mediaViewEventEmitter } from "../../components/media-views";
import { ObjectContentOrigins } from "../../object-types";
import { addMediaAndSetTransform } from "../util/Media";
import { staticObjectManipulator } from "./StaticObjectManipulator";

export class ChangeVideoService {

  constructor(){

  }

  start(){
    /* empty start to ensure the import is made*/
  }

  /*async changeVideo() {
    this.removeNode();
    window.APP.mediaSearchStore.sourceNavigateWithResult(this.data.projection === "360-equirectangular" ? "videos360" : "videos").then(entry => {
      if (entry.camera) {
        mediaViewEventEmitter.once("camera_created", (data) => {
          this.reloadSrc(data.src);
          //this.networkedEl.emit("reload_src_after_change",data.src);
        });
      } else {
        this.reloadSrc(entry.url);
        //this.networkedEl.emit("reload_src_after_change",entry.src);
      }
    });
  }*/

  videoChoosing = false;
  async changeVideo(networkID) {
    const entity = NAF.entities.entities[networkID];
    const mediaOptions = entity.components["media-loader"].data.mediaOptions;
    const scene = entity.sceneEl;
    try {
      window.APP.mediaSearchStore.sourceNavigateWithResult(mediaOptions.projection === "360-equirectangular" ? "videos360" : "videos").then(entry => {
        scene.emit("action_end_video_sharing");
        this.videoChoosing = true;
        const rotation = entity.object3D.rotation.clone();
        const position = entity.object3D.position.clone();
        const scale = new THREE.Vector3();
        scale.set(entity.object3D.scale.x, entity.object3D.scale.y, entity.object3D.scale.z);
        console.log(entity);
        if (entry.camera || entry.shareScreen) {
          mediaViewEventEmitter.once("share_video_media_stream_created", (data) => {
            staticObjectManipulator.deactivateNode(networkID);
            const currentVideoShareEntity = addMediaAndSetTransform(data.src, position, rotation, scale, mediaOptions, ObjectContentOrigins.URL, true);
            setTimeout(() => {
              scene.addEventListener("action_end_video_sharing", () => {
                if (this.videoChoosing) {
                  console.info("action_end_video_sharing ignored by videochoosing");
                  return;
                }
                if (currentVideoShareEntity && currentVideoShareEntity.parentNode) {
                  NAF.utils.takeOwnership(currentVideoShareEntity);
                  currentVideoShareEntity.parentNode.removeChild(currentVideoShareEntity);
                }
                setTimeout(() => {
                  if (this.videoChoosing) {
                    console.info("respawnStaticAt ignored by videochoosing");
                    return;
                  }
                  console.log("respawnStaticAt");
                  staticObjectManipulator.reactivateNodeAt(position);
                }, 1000);
              }, {
                once: true
              });
              this.videoChoosing = false;
            }, 0);
          });
        } else {
          staticObjectManipulator.deactivateNode(networkID);
          addMediaAndSetTransform(entry.url, position, rotation, scale, mediaOptions, entry.contentOrigin, true);
          this.videoChoosing = false;
        }
      });
    }catch (e) {
      this.videoChoosing = false;
    }
  }

}


export const changeVideoService = new ChangeVideoService();
