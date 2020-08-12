import { customActionRegister } from "./service/CustomActionRegister";
import { networkService } from "./service/NetworkService";

AFRAME.registerComponent("custom-controller-action", {
  schema: {
    actionIds: { type: "string" }
  },

  init() {
    this._updateUI = this._updateUI.bind(this);
    this._updateUIOnStateChange = this._updateUIOnStateChange.bind(this);
    this.onHovered = () => {
      this.hovering = true;
      this._updateUI();
    };

    this.onUnhovered = () => {
      this.hovering = false;
      this._updateUI();
    };
    this.onClick = () => {
      if (this.data.actionIds) {
        if(this.data.type==="animation") {
          this.data.actionIds.split("+").forEach(id => {
            let action = customActionRegister.actions[id];
            if (action) {
              action();
              networkService.sendMessage("animation_play", { id })
            }
          });
        }else if(this.data.type==="spawn"){
          //
        }
      }
    };
  },

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
    this.el.object3D.addEventListener("hovered", this.onHovered);
    this.el.object3D.addEventListener("unhovered", this.onUnhovered);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
    this.el.object3D.removeEventListener("hovered", this.onHovered);
    this.el.object3D.removeEventListener("unhovered", this.onUnhovered);
  },

  remove() {
    this.el.sceneEl.removeEventListener("stateadded", this._updateUIOnStateChange);
    this.el.sceneEl.removeEventListener("stateremoved", this._updateUIOnStateChange);
  },

  _updateUIOnStateChange(e) {
    if (e.detail !== "frozen") return;
    this._updateUI();
  },

  _updateUI() {
  }
});