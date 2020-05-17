import { networkService } from "./network";
import { waitForDOMContentLoaded } from "../../utils/async-utils";


const floatEqual = (a, b,ep) => {
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

  removedEntity={};

  constructor(){
    networkService.onMessage("RoomRemover-remove-entity",(networkID)=>{
      console.log("remove net "+networkID);
    });
    networkService.onMessage("RoomRemover-remove-entity-all",(removedEntity)=>{
      console.log("remove all net "+removedEntity);
      this.removeNode(removedEntity);
    });


    networkService.eventEmitter.once("adapter_ready",()=>{
        const entKeys = Object.keys(NAF.entities.entities);
        console.error(entKeys)
        entKeys.forEach(keyA => {
          const ax = NAF.entities.entities[keyA].object3D.position.x;
          const ay = NAF.entities.entities[keyA].object3D.position.y;
          const az = NAF.entities.entities[keyA].object3D.position.z;
          entKeys.forEach(keyB => {
            const bx = NAF.entities.entities[keyB].object3D.position.x;
            const by = NAF.entities.entities[keyB].object3D.position.y;
            const bz = NAF.entities.entities[keyB].object3D.position.z;
            if(floatEqual(ax,bx,0.001) && floatEqual(ay , by,0.001) && floatEqual(az , bz,0.001) && keyA!==keyB){
              if(keyA.length >= 15){
                console.error("object colision "+keyA)
                //HACK this mean that this object is a room attached object
                this.removeNode(keyA);
              }else if(keyB.length >= 15){
                console.error("object colision"+keyB)
                //HACK this mean that this object is a room attached object
                this.removeNode(keyB);
              }
            }
          })
        })
    });
    waitForDOMContentLoaded().then(() => {
      document.body.addEventListener('clientConnected', (evt) => {
        networkService.sendMessage("RoomRemover-remove-entity-all",Object.keys(this.removedEntity))
        Object.keys(this.removedEntity).forEach(key => {
          this.removeNode(key);
        })
      });
    });
  }

  removeNode(netID) {
    const ent = NAF.entities.entities[netID];
    if(!ent) return;
    if (!NAF.utils.isMine(ent) && !NAF.utils.takeOwnership(ent)) return;

    ent.setAttribute("animation__remove", {
      property: "scale",
      dur: 200,
      to: { x: 0.01, y: 0.01, z: 0.01 },
      easing: "easeInQuad"
    });

    ent.addEventListener("animationcomplete", () => {
      NAF.utils.takeOwnership(ent);
      console.log("removed "+NAF.utils.getNetworkId(ent))
      if(ent.parentNode) {
        ent.parentNode.removeChild(ent);
        this.entityRemoved(NAF.utils.getNetworkId(ent));
      }
    });
  }

  entityRemoved(networkID){
    this.removedEntity[networkID]=networkID;
    networkService.sendMessage("RoomRemover-remove-entity",networkID)
  }

}

export const roomInteractableRemover = new RoomInteractableRemover();
