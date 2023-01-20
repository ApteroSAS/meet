import { customActionRegister } from "../api/CustomActionRegister";
import configs from "../../../../utils/configs";
import { searchService } from "../service/SearchService";

AFRAME.registerComponent("custom-controller-action", {
  schema: {
    actionIds: { type: "string" },
    triggerId: { type: "string" },
    type: { type: "string" }
  },

  applyPerm(object3D, data) {
    object3D.visible = false;
    let authorizationData = customActionRegister.triggers[data.triggerId].authorization;
    if (configs.isAdmin()) {
      object3D.visible = true;
    }
    if (authorizationData.permission && window.APP.hubChannel.can(authorizationData.permission)) {
      object3D.visible = true;
    }
    if (authorizationData.emails) {
      let ownerEmail = window.APP.hubChannel.store.state.credentials.email;
      authorizationData.emails.split(",").forEach((email) => {
        if (ownerEmail === email) {
          object3D.visible = true;
        }
      });
    }
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

    let triggerData = customActionRegister.triggers[this.data.triggerId];
    if (triggerData.authorization) {
      window.APP.hubChannel.addEventListener("permissions_updated", () => {
        this.applyPerm(this.el.object3D, this.data);
      });
      this.applyPerm(this.el.object3D, this.data);
    }
    this.clickWIP = false;

    this.onClick = async () => {
      if (this.data.type === "btn-ask") {
        //special case for search with result. Closing the search panel is not detected so we have to unblock the previous click in case the panel is still open
        await searchService.cancelSearchWithResult(0);
      }
      if (!this.clickWIP) {
        this.clickWIP = true;
        try {
          let entry = null;
          if (this.data.type === "btn-ask") {
            entry = await searchService.sourceNavigateWithResult(this.data.source || "videos2d-simple");
          }
          if (this.data.actionIds) {
            let ids = this.data.actionIds.split("+");
            for (const id of ids) {
              await customActionRegister.triggerAction(id, entry);
            }
          }
          await new Promise(resolve => {
            setTimeout(resolve,600);//prevent spam click
          });
          this.clickWIP = false;
        } catch (ex) {
          this.clickWIP = false;
          console.warn(ex);
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
