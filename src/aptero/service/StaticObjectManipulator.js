import { networkService } from "./NetworkService";
import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { addMediaAndSetTransform } from "../util/Media";
import { Vector3 } from "three";


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

export class StaticObjectManipulator {

  deactivatedEntity = {};
  staticEntities = {};

  constructor() {
  }

  start(){

    networkService.eventEmitter.once("adapter_ready", () => {
      //When the network is ready on our side we store the static media
      const entKeys = Object.keys(NAF.entities.entities);
      entKeys.forEach(keyA => {
        this.storeStaticMedia(keyA, NAF.entities.entities[keyA]);
      });
    });

    ///////////////////////////
    //when a new client connects we send him the state of the room what is deactivated etc...
    //////////////////////////
    networkService.onMessage("StaticObjectManipulator-update", (data) => {
      if(data && data.deactivatedEntities && NAF.clientId!==data.clientID) {
        console.log("recv update");
        this.deactivatedEntity = data.deactivatedEntities;
        this.updateVisibilityLocal();
      }
    });

    waitForDOMContentLoaded().then(() => {
        document.body.addEventListener("clientConnected", (evt) => {
          console.log("clientConnected",evt);
          if(Object.keys(this.deactivatedEntity).length!==0) {
            this.privateSendUpdateViaNetwork();
          }
        });
    });
    ///////////////////////////
    //end
    ///////////////////////////
  }

  privateSendUpdateViaNetwork(){
    networkService.sendMessage("StaticObjectManipulator-update",{deactivatedEntities:this.deactivatedEntity,clientID:NAF.clientId});
    console.log("send update");
    this.updateVisibilityLocal();
  }

  updateVisibilityLocal(){
    const deactivatedEntities = Object.keys(this.deactivatedEntity);
    this.makeAllVisible();
    deactivatedEntities.forEach(key => {
      this.markInvisible(key);
    });
  }

  markInvisible(netID){
    const ent = NAF.entities.entities[netID];
    if (!ent) return;
    ent.object3D.visible = false;
    console.info("deactivate : "+netID);
  }

  deactivateNode(netID,fromNetwork) {
    if(this.isStaticMedia(netID)) {
      if(this.deactivatedEntity[netID]){
        return;
      }
      this.deactivatedEntity[netID] = netID;
      this.markInvisible(netID);
      if(!fromNetwork) {
        this.privateSendUpdateViaNetwork();
      }
    }else{
      throw new Error("deactivating interactable media");
    }
  }

  reactivateNodeAt(position) {
    Object.keys(this.staticEntities).forEach(staticKey => {
        const ax = this.staticEntities[staticKey].position.x;
        const ay = this.staticEntities[staticKey].position.y;
        const az = this.staticEntities[staticKey].position.z;
        if (floatEqual(ax, position.x, 0.001) && floatEqual(ay, position.y, 0.001) && floatEqual(az, position.z, 0.001)) {
          this.reactivateNode(staticKey);
        }
    });
  }


  reactivateNode(staticKey,fromNetwork){
    console.info("activate : "+staticKey);
    delete this.deactivatedEntity[staticKey];
    const ent = NAF.entities.entities[staticKey];
    ent.object3D.visible=true;
    if(!fromNetwork) {
      this.privateSendUpdateViaNetwork();
    }
  }

  cleanUp() {
    if (!this.cleanUpState) {
      this.cleanUpState = true;
      setTimeout(() => {
        this.reactivateAllAndRemoveDuplicate();
        this.cleanUpState = false;
      }, 1000);
    }
  }

  isStaticMedia(id) {
    //HACK this mean that this object is a room attached object
    return id.length >= 15;
  }

  reactivateAllAndRemoveDuplicate() {
    const entKeys = Object.keys(NAF.entities.entities);
    this.deactivatedEntity={};//mark all as activated
    this.makeAllVisible();
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
          if (this.isStaticMedia(keyA)) {
            this.deactivateNode(keyA);
          } else if (this.isStaticMedia(keyB)) {
            this.deactivateNode(keyB);
          }
        }
      });
    });
  }

  makeAllVisible(){
    Object.keys(this.staticEntities).forEach(staticKey => {
      const ent = NAF.entities.entities[staticKey];
      ent.object3D.visible = true;
    });
  }

  storeStaticMedia(key, entity) {
    if (this.isStaticMedia(key)) {
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

}


export const staticObjectManipulator = new StaticObjectManipulator();
