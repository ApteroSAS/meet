import { setTimeout } from "core-js";
//import UIRoot from "../../react-components/ui-root";

AFRAME.registerComponent("open-iframe-button", {

  init() {
  },
  play() {
    this.el.object3D.addEventListener("interact", this.click);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.click);
  },

  click() {
    const target = this.el.previousElementSibling.components["open-media-button"].src;
    const obj = {
      url : target,
      type : "sidebar_iframe",
      title:"viewer"
    }
    this.el.sceneEl.emit("action_toggle_custom_sidebar");
    setTimeout(()=>{this.el.sceneEl.emit("action_toggle_custom_sidebar_info",obj)},10);
    
  }
});