AFRAME.registerComponent("stop-share-screen-on-destroy", {

  schema: {
    target: { type: "string" },
  },

  init() {
    console.log("init "+this.data.target)
  },

  remove() {
    if(NAF.clientId === this.data.target){
      console.log("share screen removed");
      AFRAME.scenes[0].emit("action_end_video_sharing");
    }
  },
});
