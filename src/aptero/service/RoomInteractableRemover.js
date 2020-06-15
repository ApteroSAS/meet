import { networkService } from "./NetworkService";
import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { addMediaAndSetTransform } from "../util/Media";


const floatEqual = (a, b, ep) => {
  if (a === b) {
    return true;
  }

  const diff = Math.abs(a - b);

  if (diff < ep) {
    return true;
  }

  return diff <= ep * Math.min(Math.abs(a), Math.abs(b));
};

export class RoomInteractableRemover {

  removedEntity = {};
  staticEntities = {};

  constructor() {
  }

  start(){
    networkService.onMessage("RoomRemover-remove-entity", (networkID) => {
    });
    networkService.onMessage("RoomRemover-remove-entity-all", (removedEntity) => {
      this.removeNode(removedEntity);
    });

    networkService.eventEmitter.once("adapter_ready", () => {
      const entKeys = Object.keys(NAF.entities.entities);
      entKeys.forEach(keyA => {
        this.storeStaticMedia(keyA, NAF.entities.entities[keyA]);
      });
      this.removeDuplicate();
    });
    waitForDOMContentLoaded().then(() => {
      document.body.addEventListener("clientConnected", (evt) => {
        networkService.sendMessage("RoomRemover-remove-entity-all", Object.keys(this.removedEntity));
        Object.keys(this.removedEntity).forEach(key => {
          this.removeNode(key);
        });
      });
    });
  }

  isStaticMedia(id) {
    //HACK this mean that this object is a room attached object
    return id.length >= 15;
  }

  storeStaticMedia(key, entity) {
    if (key.length >= 15) {
      this.staticEntities[key] = {
        entity: entity,
        position:{
          x: entity.object3D.position.x,
          y: entity.object3D.position.y,
          z: entity.object3D.position.z,
        },
        scale:{
          x:entity.object3D.scale.x,
          y: entity.object3D.scale.y,
          z: entity.object3D.scale.z,
        },
        src: entity.components["media-loader"].data.src
      };
    }
  }

  removeNode(netID) {
    console.log("remove : " + netID);
    const ent = NAF.entities.entities[netID];
    if (!ent) return;
    if (!NAF.utils.isMine(ent) && !NAF.utils.takeOwnership(ent)) return;
    //UnPin
    ent.setAttribute("pinnable", "pinned", false);
    ent.emit("unpinned", { el: ent });

    ent.setAttribute("animation__remove", {
      property: "scale",
      dur: 200,
      to: { x: 0.01, y: 0.01, z: 0.01 },
      easing: "easeInQuad"
    });

    ent.addEventListener("animationcomplete", () => {
      NAF.utils.takeOwnership(ent);
      if (ent.parentNode) {
        ent.parentNode.removeChild(ent);
        this.entityRemoved(NAF.utils.getNetworkId(ent));
      }
    });
  }

  removeDuplicate() {

    const entKeys = Object.keys(NAF.entities.entities);
    entKeys.forEach(keyA => {
      const entA = NAF.entities.entities[keyA];
      const ax = entA.object3D.position.x;
      const ay = entA.object3D.position.y;
      const az = entA.object3D.position.z;
      entKeys.forEach(keyB => {
        const entB = NAF.entities.entities[keyB];
        const bx = entB.object3D.position.x;
        const by = entB.object3D.position.y;
        const bz = entB.object3D.position.z;
        if (floatEqual(ax, bx, 0.001) && floatEqual(ay, by, 0.001) && floatEqual(az, bz, 0.001) && keyA !== keyB) {
          //1st case the dynamic object is the same (same src) as the static one => remove the dynamic one
          //2nd case it is not the same remove the static one
          if (entA.components["media-loader"].data.src === entB.components["media-loader"].data.src) {
            if (!this.isStaticMedia(keyA)) {
              this.removeNode(keyA);
            } else if (!this.isStaticMedia(keyB)) {
              this.removeNode(keyB);
            }
          } else {
            if (this.isStaticMedia(keyA)) {
              this.removeNode(keyA);
            } else if (this.isStaticMedia(keyB)) {
              this.removeNode(keyB);
            }
          }
        }
      });
    });
  }

  cleanUp() {
    if (!this.cleanUpState) {
      this.cleanUpState = true;
      setTimeout(() => {
        this.removeDuplicate();
        this.recomputeStaticMedia();
        this.cleanUpState = false;
      }, 1000);
    }
  }

  recomputeStaticMedia() {
    console.log("recomputeStaticMedia placeholder");
    const entKeys = Object.keys(NAF.entities.entities);
    Object.keys(this.staticEntities).forEach(staticKey => {
      let hasBeenRemoved = !NAF.entities.entities[staticKey];
      if (hasBeenRemoved) {
        const ax = this.staticEntities[staticKey].position.x;
        const ay = this.staticEntities[staticKey].position.y;
        const az = this.staticEntities[staticKey].position.z;
        let foundSameSpaceEntity = false;
        entKeys.forEach(keyB => {
          const bx = NAF.entities.entities[keyB].object3D.position.x;
          const by = NAF.entities.entities[keyB].object3D.position.y;
          const bz = NAF.entities.entities[keyB].object3D.position.z;
          if (floatEqual(ax, bx, 0.001) && floatEqual(ay, by, 0.001) && floatEqual(az, bz, 0.001)) {
            foundSameSpaceEntity = true;
          }
        });
        if (!foundSameSpaceEntity) {
          this.privateRespawn(staticKey);
        }
      }

    });
  }

  privateRespawn(staticKey){
    //respawn media
    addMediaAndSetTransform(this.staticEntities[staticKey].src,
      this.staticEntities[staticKey].position,
      this.staticEntities[staticKey].entity.object3D.rotation,
      this.staticEntities[staticKey].scale,
      this.staticEntities[staticKey].entity.components["media-loader"].data.mediaOptions, undefined, true);
    //you should pin the respawned object otherwise user will move it
    console.log("respawn entity :" + this.staticEntities[staticKey].src);
  }

  entityRemoved(networkID) {
    this.removedEntity[networkID] = networkID;
    networkService.sendMessage("RoomRemover-remove-entity", networkID);
  }

  respawnStaticAt(position) {
    Object.keys(this.staticEntities).forEach(staticKey => {
      let hasBeenRemoved = !NAF.entities.entities[staticKey];
      if (hasBeenRemoved) {
        const ax = this.staticEntities[staticKey].position.x;
        const ay = this.staticEntities[staticKey].position.y;
        const az = this.staticEntities[staticKey].position.z;
        if (floatEqual(ax, position.x, 0.001) && floatEqual(ay, position.y, 0.001) && floatEqual(az, position.z, 0.001)) {
          this.privateRespawn(staticKey);
        }
      }

    });
  }
}


export const roomInteractableRemover = new RoomInteractableRemover();
