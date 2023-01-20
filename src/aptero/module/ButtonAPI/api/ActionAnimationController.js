import { customActionRegister } from "./CustomActionRegister";
import { findAncestorWithComponent } from "../../../../utils/scene-graph";
import { networkService } from "../../HubsBridge/service/NetworkService";

export class ActionAnimationController{

    init(){
        networkService.onMessage("animation_play", ({  body }) => {
            let actionid = body.id;
            let action = customActionRegister.actions[actionid];
            if (action) {
                action.callback();
            }
        });
    }

    setup(htmlElement,action,actionid){
        const mixerEl = findAncestorWithComponent(htmlElement, "animation-mixer");
        let mixer = mixerEl && mixerEl.components["animation-mixer"].mixer;
        let actionAnimation = mixer.clipAction(action.data);
        if (actionAnimation) {
            customActionRegister.actions[actionid] =
                {
                    action: action,
                    callback: () => {
                        actionAnimation.reset();
                        actionAnimation.play();
                        actionAnimation.setLoop(THREE.LoopRepeat, 1);
                    }
                };
        } else {
            console.warn("invalid extension data on animation " + action.data + " not found on mesh");
        }
    }
}