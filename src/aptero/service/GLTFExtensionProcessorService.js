import { customActionRegister } from "./CustomActionRegister";
import { networkService } from "./NetworkService";

let jquery = require("jquery");

//apt.animation.controller
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

export class GLTFExtensionProcessorService {

  async start() {
    networkService.onMessage("animation_play", (data) => {
      let actionid = data.id;
      let action = customActionRegister.actions[actionid];
      if (action) {
        action();
      }
    });
  }

  processGltfFile(gltf, el) {
    let scene = gltf.scene || gltf.scenes[0];
    let sceneuuid = scene.uuid;
    scene.children.forEach(mesh => {
      let meshuuid = mesh.uuid;
      let meshName = mesh.name;
      if (mesh.userData && mesh.userData["apt.action.controller"]) {
        let jsonData = mesh.userData["apt.action.controller"];
        if (typeof jsonData === "string" && jsonData.startsWith("\"") && jsonData.endsWith("\"")) {
          jsonData = jsonData.substring(1, jsonData.length - 1);
        }
        if (typeof jsonData === "string") {
          jsonData = JSON.parse(jsonData);
        }
        jsonData.forEach(async (entry, index) => {
          await this.processEntry(entry, el.id, sceneuuid, meshuuid, meshName, index);
        });
      }
    });
  }

  async processEntry(entry, elid, sceneuuid, meshuuid, meshName, pairIndex) {
    let element = jquery("#" + elid);
    let htmlElement = element.get()[0];
    let networkId = await networkService.getElementNetworkId(htmlElement);
    console.log("registered custom animation controller", sceneuuid, meshuuid, meshName, element);
    let actionIds = [];
    entry.actions.forEach((action, index) => {
      let actionid = networkId + "_" + pairIndex + "_" + meshName + "_" + index + "_" + (action.data || "");
      actionIds.push(actionid);
      if (action.type === "animation") {
        let mixer = htmlElement.components["animation-mixer"].mixer;
        let actionAnimation = mixer.clipAction(action.data);
        if(actionAnimation) {
          customActionRegister.actions[actionid] =
            {
              action: action,
              callback: () => {
                actionAnimation.reset();
                actionAnimation.play();
                actionAnimation.setLoop(THREE.LoopRepeat, 1);
              }
            };
        }else{
          console.warn("invalid extension data on animation "+action.data+" not found on mesh");
        }
      } else {
        customActionRegister.actions[actionid] = {action:action};
      }
    });
    entry.triggers.forEach(trigger => {
      this.createButtonOnElement(actionIds, element, trigger.position, trigger.rotation, trigger.text);
    });

  }

  createButtonOnElement(actionsIds, element, position, rotationDeg, text, addReverse = true) {
    if (addReverse) {
      this.createButtonOnElement(actionsIds, element, position, rotationDeg, text, false);
      rotationDeg.y += 180;
    }
    //1) apply transform to button
    let positionUpdated = element.get()[0].object3D.parent.localToWorld(new THREE.Vector3(position.x / 10, position.z / 10, -position.y / 10));
    //element.append('<a-box color="tomato" position="'+positionUpdated.x+' '+positionUpdated.y+' '+positionUpdated.z+'" depth="0.1" height="0.1" width="0.1"></a-box>')
    element.append(
      "   <a-entity\n" +
      "       mixin=\"rounded-text-action-button\"\n" +
      "       is-remote-hover-target\n" +
      "       custom-controller-action=\"actionIds:" + actionsIds.join("+") + "\"\n" +
      "       tags=\"singleActionButton:true\"\n" +
      "       rotation=\"" + rotationDeg.x + " " + rotationDeg.y + " " + rotationDeg.z + "\"\n" +
      "       position=\"" + positionUpdated.x + " " + positionUpdated.y + " " + positionUpdated.z + "\">\n" +
      "       <a-entity\n" +
      "           class=\"pin-button-label\"\n" +
      "           visible=\"true\"\n" +
      "           text=\" value:" + text + "; width:1.75; align:center;\"\n" +
      "           text-raycast-hack\n" +
      "           position=\"0 0 0\">\n" +
      "       </a-entity>\n" +
      "   </a-entity>");
  }
}

export const gltfExtensionProcessorService = new GLTFExtensionProcessorService();