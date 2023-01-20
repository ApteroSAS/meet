AFRAME.registerComponent("release-media-frame-on-destroy", {

  schema: {
    target: { type: "string" },
  },

  init() {
    console.log("init "+this.data.target)
  },

  async findMediaFrameByName(name) {
    return new Promise((resolve, reject) => {
      let mediaFrame = null;
      Object.keys(NAF.entities.entities).forEach(key => {
        let frame = NAF.entities.entities[key];
        if (frame.className === name) {
          mediaFrame = frame;
        }
      });
      resolve(mediaFrame);
    });
  },

  async remove() {
    let mediaFrame = await this.findMediaFrameByName(this.data.target);
    if(mediaFrame) {
      let mediaFrameComponent = mediaFrame.components["media-frame"];
      if (mediaFrameComponent.data.targetId !== "empty") {
        mediaFrameComponent.release();
      }
    }else{
      console.error("invalid media frame : "+this.data.target);
    }
  },
});
