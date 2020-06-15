import { roomInteractableRemover } from "./RoomInteractableRemover";
import { mediaViewEventEmitter } from "../../components/media-views";
import { ObjectContentOrigins } from "../../object-types";
import { addMediaAndSetTransform } from "../util/Media";

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

  async changeVideo(networkID) {
    const entity = NAF.entities.entities[networkID];
    const mediaOptions = entity.components["media-loader"].data.mediaOptions;
    const scene = entity.sceneEl;
    scene.emit("action_end_video_sharing");
    window.APP.mediaSearchStore.sourceNavigateWithResult(mediaOptions.projection === "360-equirectangular" ? "videos360" : "videos").then(entry => {
      const rotation = entity.object3D.rotation;
      const position = entity.object3D.position;
      const scale = new THREE.Vector3();
      scale.set(entity.object3D.scale.x, entity.object3D.scale.y, entity.object3D.scale.z);
      console.log(entity);
      if (entry.camera || entry.shareScreen) {
        mediaViewEventEmitter.once("share_video_media_stream_created", (data) => {
          roomInteractableRemover.removeNode(networkID);
          const currentVideoShareEntity = addMediaAndSetTransform(data.src, position, rotation, scale, mediaOptions, ObjectContentOrigins.URL,true);
          setTimeout(()=>{
            scene.addEventListener("action_end_video_sharing", ()=>{
              if (currentVideoShareEntity && currentVideoShareEntity.parentNode) {
                NAF.utils.takeOwnership(currentVideoShareEntity);
                currentVideoShareEntity.parentNode.removeChild(currentVideoShareEntity);
              }
              setTimeout(()=> {
                console.log("respawnStaticAt");
                roomInteractableRemover.respawnStaticAt(position);
              },2000);
            },{
              once : true
            });
          },0)
        });
      } else {
        roomInteractableRemover.removeNode(networkID);
        addMediaAndSetTransform(entry.url, position, rotation, scale, mediaOptions, entry.contentOrigin,true);
      }
    });
  }

}


export const changeVideoService = new ChangeVideoService();
