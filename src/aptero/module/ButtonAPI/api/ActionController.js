import { customActionRegister } from "./CustomActionRegister";
import { networkService } from "../../HubsBridge/service/NetworkService";

export class ActionController {
  async start() {
    await customActionRegister.start();
  }

  process(jsonData, id, sceneuuid, meshuuid, meshName, masterindex) {
    if(!jsonData){
      return;
    }
    //apt.action.controller
    /*let example = [{
      triggers: [{
        type: "btn",
        text:"fire",
        position: {x:2.0,y:2.0,z:0.0},
        rotation:{x:0.0,y:0.0,z:0.0},
      }],
      actions: [{
        type:"animation",
        data:"muzzle fire"
      }]
    }];*/

    if (typeof jsonData === "string" && jsonData.startsWith("\"") && jsonData.endsWith("\"")) {
      jsonData = jsonData.substring(1, jsonData.length - 1);
    }
    if (typeof jsonData === "string" ) {
      if(jsonData.replaceAll) {
        jsonData = jsonData.replaceAll("\\\"", "\"");
      }
      jsonData = JSON.parse(jsonData);
    }
    jsonData.forEach(async (entry, index) => {
      const version = entry.version || 1;
      await this.processEntry(entry, id, sceneuuid, meshuuid, meshName, index, masterindex,version);
    });
  }

  async processEntry(entry, elid, sceneuuid, meshuuid, meshName, pairIndex, masterindex,version) {
    const jquery = (await import('jquery')).default;
    let element = jquery("#" + elid);
    let htmlElement = element.get()[0];
    let networkId = await networkService.getElementNetworkId(htmlElement) || "local";
    console.log("registered custom controller", sceneuuid, meshuuid, meshName);
    let actionIds = [];
    entry.actions.forEach((action, index) => {
      let actionid = networkId + "_" + meshName + "_" + masterindex + "_" + pairIndex + "_" + index + "_" + (action.data || "");
      let differentiator = 0;
      while (customActionRegister.actionExist(actionid+ "_"+ differentiator)){
        differentiator++;
      }
      actionid = actionid + "_"+ differentiator;
      actionIds.push(actionid);
      customActionRegister.setup(htmlElement, action, actionid);
    });
    entry.triggers.forEach((trigger, index) => {
      let triggerId = networkId + "_" + meshName + "_" + masterindex + "_" + pairIndex + "_" + index;
      customActionRegister.triggers[triggerId]=trigger;
      if (trigger.type === "btn" || trigger.type === "btn-ask") {
        if(!trigger.position){
          trigger.position=new THREE.Vector3(0,0,0);
        }
        if(!trigger.rotation){
          trigger.rotation=new THREE.Vector3(0,0,0);
        }
        this.createButtonOnElement(trigger.type, triggerId, actionIds, element, trigger.position, trigger.rotation, trigger.text, trigger.size, trigger.textWidth, trigger.style,version);
      } else {
        throw new Error("invalid btn type");
      }
    });

  }

  createButtonOnElement(type, triggerId, actionsIds, element, position, rotationDeg, text, size, textWidth, style, version = 1, addReverse = true) {
    if (addReverse) {
      this.createButtonOnElement(type, triggerId, actionsIds, element, position, rotationDeg, text, size, textWidth, style,version, false);
      rotationDeg.y += 180;
    }
    //1) apply transform to button
    let positionUpdated = new THREE.Vector3(position.x,position.y,position.z);
    if(version===1) {
      //TODO deprecated v1
      positionUpdated.z = -(position.y)+0.25;
      positionUpdated.y = position.z;
      size = (+size) * 4
    }
    //element.append('<a-box color="tomato" position="'+positionUpdated.x+' '+positionUpdated.y+' '+positionUpdated.z+'" depth="0.1" height="0.1" width="0.1"></a-box>')
    element.append(
        "   <a-entity\n" +
        //"       mixin=\"rounded-text-action-button\"\n" +
        "       mixin=\"" + (style || "rounded-button") + "\"\n" +
        "       is-remote-hover-target\n" +
        "       class='interactable'\n" +
        "       custom-controller-action=\"actionIds:" + actionsIds.join("+") + ";triggerId:" + triggerId + ";type:" + type + "\"\n" +
        "       tags=\"singleActionButton:true\"\n" +
        "       scale=\"" + (size || "1") + " " + (size || "1") + " " + (size || "1") + "\" \n" +
        "       rotation=\"" + (rotationDeg ? (rotationDeg.x + " " + rotationDeg.y + " " + rotationDeg.z) : "0 0 0") + "\"\n" +
        "       position=\"" + positionUpdated.x + " " + positionUpdated.y + " " + positionUpdated.z + "\">\n" +
        "       <a-entity\n" +
        "           visible=\"true\"\n" +
        "           text=\" value:" + (text || "click") + "; width:" + (textWidth || "1.75") + "; align:center;\"\n" +
        "           text-raycast-hack\n" +
        "           position=\"0 0 0\">\n" +
        "       </a-entity>\n" +
        "   </a-entity>");
  }
}
