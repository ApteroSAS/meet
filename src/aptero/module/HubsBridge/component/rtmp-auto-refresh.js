//import * as Hls from "hls";
//https://github.com/video-dev/hls.js/blob/master/docs/API.md#error-recovery-sample-code

AFRAME.registerComponent("rtmp-auto-refresh", {
  init() {
    this.errCallback = null;
    this.nominalCallback = null;
    this.waitMode = false;
    this.lastHls = null;
    this.interval = setInterval(() => {
      if (this.targetEl) {
        const c = this.targetEl.components;
        if (c["media-video"] && c["media-video"].videoTexture && c["media-video"].videoTexture.hls) {
          const hls = c["media-video"].videoTexture.hls;
          if(hls!==this.lastHls) {
            console.log("RTMP setup hls listener")
            this.lastHls = hls;
            if(this.errCallback) {
              this.lastHls.off("hlsError", this.errCallback);
            }
            if(this.nominalCallback) {
              this.lastHls.off("hlsFragLoaded", this.nominalCallback);
            }
            this.errCallback = (event, data) => {
              this.waitMode = true;
              if (data.fatal) {
                switch (data.type) {
                  case 'networkError':  //case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log('fatal network error encountered, try to recover');
                    hls.startLoad();
                    break;
                  case 'mediaError': //case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('fatal media error encountered, try to recover');
                    hls.recoverMediaError();
                    break;
                  default:
                    hls.destroy();
                    break;
                }
              }
            };
            //hls.on(Hls.Events.ERROR, this.errCallback);
            hls.on("hlsError", this.errCallback);
            this.nominalCallback = () =>{
              this.waitMode = false;
            };
            hls.on("hlsFragLoaded", this.nominalCallback);
          }
          if(this.waitMode){
            console.log("HLS wait");
            hls.recoverMediaError();
            //c["media-loader"].update(c["media-loader"].data, true);
          }else{
            //console.log("HLS nominal");
            /*nothing*/
          }
        } else if (c["media-loader"]) {
          console.log("RTMP update 1")
          // Otherwise fall back to hard resolve-level refresh which should work for any media
          fetch(c["media-loader"].data.src).then(() => {
                c["media-loader"].update(c["media-loader"].data, true);
              })
              .catch(() => {/*ignore*/});
        }
      }else{
        console.log("RTMP grab network");
        //const c = this.el.components;
        //c["media-loader"].refresh();
        NAF.utils
            .getNetworkedEntity(this.el)
            .then(networkedEl => (this.targetEl = networkedEl));
      }
    }, 4000);
  },

  remove() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if(this.lastHls) {
      this.lastHls.off("hlsError", this.errCallback);
      this.lastHls.off("hlsFragLoaded", this.nominalCallback);
    }
  }

});
