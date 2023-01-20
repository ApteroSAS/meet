function video360ServiceIntegration(){
  //TODO aptero put this code in a service for easier merge
  if (sceneUrl.endsWith(".mp4")) {
    const mp4url = sceneUrl;
    sceneUrl = configs.PROTOCOL+configs.RETICULUM_SERVER+"/data/data/VideoConf.glb";

    {
      //remove old element
      const videoEl = document.querySelector("#video");
      const videoSphereEl = document.querySelector("#environment-scene-video");
      if (videoEl && videoSphereEl) {
        videoEl.parentNode.removeChild(videoEl);
        videoSphereEl.parentNode.removeChild(videoSphereEl);
      }
    }
    const addVideo360 = () => {
      /*const aAssetsEl = document.createElement("a-assets");
      aAssetsEl.setAttribute("id", "aassets");
      aAssetsEl.setAttribute("timeout", "4500");*/

      const videoEl = document.createElement("video");
      videoEl.setAttribute("id", "video");
      videoEl.setAttribute("style", "display:none");
      videoEl.setAttribute("autoplay", "");
      videoEl.setAttribute("loop", "");
      videoEl.setAttribute("crossorigin", "anonymous");
      videoEl.setAttribute("playsinline", "");
      videoEl.setAttribute("webkit-playsinline", "");
      //videoEl.setAttribute("src", mp4url);

      const sourceEl = document.createElement("source");
      sourceEl.setAttribute("src", mp4url);
      sourceEl.setAttribute("type", "video/mp4");
      sourceEl.setAttribute("id", "source");
      videoEl.appendChild(sourceEl);

      sceneEl.appendChild(videoEl);
      //sceneEl.appendChild(aAssetsEl);
      const makeVideoSphere = ()=>{
        videoEl.removeEventListener("loadeddata", makeVideoSphere);
        const videosphere = document.createElement("a-videosphere");
        videosphere.setAttribute("id", "environment-scene-video");
        videosphere.setAttribute("rotation", "0 180 0");
        videosphere.setAttribute("src", "#video");
        videosphere.setAttribute("play-on-window-click", "");
        videosphere.setAttribute("play-on-vrdisplayactivate-or-enter-vr", "");
        sceneEl.appendChild(videosphere);
        video360Service.enableAndSetVideo(videoEl,videosphere);
      };
      videoEl.addEventListener("loadeddata", makeVideoSphere);

      window.removeEventListener("focus", addVideo360);
    };
    if(document.hasFocus()){
      setTimeout(()=>{
        addVideo360();
      },5000);
    }else{
      window.addEventListener("focus", addVideo360);
    }
  }else{
    video360Service.disable();
  }
}