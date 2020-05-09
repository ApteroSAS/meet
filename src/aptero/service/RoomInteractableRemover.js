import { networkService } from "./network";
import { waitForDOMContentLoaded } from "../../utils/async-utils";


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
      ent.parentNode.removeChild(ent);
      this.entityRemoved(NAF.utils.getNetworkId(ent));
    });
  }

  entityRemoved(networkID){
    this.removedEntity[networkID]=networkID;
    networkService.sendMessage("RoomRemover-remove-entity",networkID)
  }

}

export const roomInteractableRemover = new RoomInteractableRemover();

