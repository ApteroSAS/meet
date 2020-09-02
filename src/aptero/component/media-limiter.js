import { mediaLimiter } from "../service/MediaLimiter";

AFRAME.registerComponent("media-limiter", {
  schema: {  },

  init() {
    mediaLimiter.pushMedia(this.el);
  },

  remove() {
    if (this.data.batch && this.mesh) {
      this.el.sceneEl.systems["hubs-systems"].batchManagerSystem.removeObject(this.mesh);
    }
    if(this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  },
});