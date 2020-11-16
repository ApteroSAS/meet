import { remoteControlService } from "../service/RemoteControlService";

export const IN_APP_WEB_BROWSER_PROTOCOL = "web-browser:";

export const processWebBrowserEntity = (entity, mediaOptions) => {
  entity.setAttribute("media-loader", { src: IN_APP_WEB_BROWSER_PROTOCOL + mediaOptions.webBrowser.sessionID + "/web-browser.mp4" });
};

export const proxyURL = (url) => {
  if (url.startsWith("hubs:")) return url;
  if (url.startsWith("https:")) return url;
  if (url.startsWith(IN_APP_WEB_BROWSER_PROTOCOL)) return url;
  return null;
};

export const remoteWebBrowser = (screenElement,texture,mediaData) => {

  // Setup a POT canvas
  let canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  texture = new THREE.Texture(canvas);


  NAF.utils.getNetworkedEntity(screenElement).then(networkedEl => {
    //hovered
    //unhovered
    delete screenElement.components["hover-menu__video"];
    let screenSRC = mediaData.src;
    screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_PROTOCOL,"");
    screenSRC = screenSRC.replace("/web-browser.mp4","");
    let screenId = networkedEl.components.networked.data.networkId;
    //singleActionButton:true;
    remoteControlService.registerEventOnElement(screenElement);
    screenElement.setAttribute("tags","singleActionButton: true;");
    remoteControlService.registerOnFrame(screenId,screenSRC,canvas.width,canvas.height,buffer => {
      // Receive a jpeg buffer frame from the websocket server in the companion app.
      let blob = new Blob([buffer], { type: "image/jpeg" });
      // Creat url from the image blob
      let ctx = canvas.getContext('2d');
      // Create an image to show the frame and copy to the canvas
      let img = new Image();
      img.onload = ()=>{
        // Draw the frame to the temp canvas.
        ctx.drawImage(img, 0, 0, canvas.width , canvas.height);
        // Set the update flag
        texture.needsUpdate = true;
      };
      // Creat url from the image blob
      img.src = URL.createObjectURL(blob);
    });
  });
  texture.isVideoTexture = true;
  texture.image.duration = Infinity;
  texture.image.play = () => { return Promise.resolve(true)};
  texture.update = ()=>{
    texture.needsUpdate = true;
  };
  return texture;
};