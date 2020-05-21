import { roomInteractableRemover } from "./RoomInteractableRemover";
import { mediaViewEventEmitter } from "../../components/media-views";
import { addMedia } from "../../utils/media-utils";
import { ObjectContentOrigins } from "../../object-types";

export class ChangeVideoService {

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

  addMediaAndSetTransform(src, position, orientationRecv, scale, mediaOptions, contentOrigin) {
    if (!contentOrigin) {
      contentOrigin = ObjectContentOrigins.URL;
    }
    const { entity, orientation } = addMedia(
      src,
      "#interactable-media",
      contentOrigin,
      mediaOptions.type && mediaOptions.type.includes("360")?"360-equirectangular":null,
      !(src instanceof MediaStream),
      true,
      true,
      mediaOptions ? mediaOptions : {}
    );
    entity.object3D.position.set(position.x, position.y, position.z);
    entity.object3D.rotation.copy(orientationRecv);
    entity.object3D.scale.set(scale.x, scale.y, scale.z);
    entity.object3D.matrixNeedsUpdate = true;

    //Pin the new object by default
    entity.setAttribute("pinnable", "pinned", true);
    entity.emit("pinned", { el: entity });
  }

  async changeVideo(networkID) {
    const entity = NAF.entities.entities[networkID];
    const mediaOptions = entity.components["media-loader"].data.mediaOptions;
    window.APP.mediaSearchStore.sourceNavigateWithResult(mediaOptions.projection === "360-equirectangular" ? "videos360" : "videos").then(entry => {
      const rotation = entity.object3D.rotation;
      const position = entity.object3D.position;
      const scale = new THREE.Vector3();
      scale.set(entity.object3D.scale.x, entity.object3D.scale.y, entity.object3D.scale.z);
      console.log(entity);
      roomInteractableRemover.removeNode(networkID);
      if (entry.camera) {
        mediaViewEventEmitter.once("camera_created", (data) => {
          this.addMediaAndSetTransform(data.src, position, rotation, scale, mediaOptions, ObjectContentOrigins.URL);
        });
      } else {
        this.addMediaAndSetTransform(entry.url, position, rotation, scale, mediaOptions, entry.contentOrigin);
      }
    });
  }

}

export const changeVideoService = new ChangeVideoService();