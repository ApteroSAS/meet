import { customActionRegister } from "./service/CustomActionRegister";

AFRAME.registerComponent("custom-controller-action", {
  schema: {
    actionIds: { type: "string" }
  },

  init() {
    console.log("toto");
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
        this.data.actionIds.split("+").forEach(id => {
          let action = customActionRegister.actions[id];
          if (action) {
            action();
          }
        });
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