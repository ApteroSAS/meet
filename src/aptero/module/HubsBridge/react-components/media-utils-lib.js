import {remoteControlServiceV2} from "../../RemoteScreen/RemoteControlServiceV2";

export const IN_APP_WEB_BROWSER_PROTOCOL = "web-browser:";
export const IN_APP_WEB_BROWSER_TRAIL = "/web-browser.mp4";

export const processWebBrowserEntity = (entity, mediaOptions) => {
  let objJsonStr = JSON.stringify({
    sessionID:mediaOptions.webBrowser.sessionID,
    startUrl:"https://google.com",
    width:1024,
    height:512,
  });
  //let metaData = Buffer.from(objJsonStr).toString("base64");
  let encoded = btoa(objJsonStr);
  entity.setAttribute("media-loader", { src: IN_APP_WEB_BROWSER_PROTOCOL + encoded + IN_APP_WEB_BROWSER_TRAIL });
};

export const proxyURL = (url) => {
  if (url.startsWith("hubs:")) return url;
  if (url.startsWith("https:")) return url;
  if (url.startsWith(IN_APP_WEB_BROWSER_PROTOCOL)) return url;
  return null;
};

export const remoteWebBrowser = async (screenElement,texture,mediaData) => {
  let screenSRC = mediaData.src;
  screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_PROTOCOL,"");
  screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_TRAIL,"");
  let metaData = JSON.parse(atob(screenSRC));
  let remoteScreenSessionId = metaData.sessionID;


  let screenId = await new Promise((resolve, reject) => {
    NAF.utils.getNetworkedEntity(screenElement).then(networkedEl => {
      //hovered
      //unhovered
      delete screenElement.components["hover-menu__video"];
      let screenId = networkedEl.components.networked.data.networkId;
      //singleActionButton:true;
      //remoteControlService.registerEventOnElement(screenElement);
      screenElement.setAttribute("tags","singleActionButton: true;");
      resolve(screenId);
    });
  });
  let connexionInfo = {
    localSessionID: screenId,
    remoteScreenSessionId: remoteScreenSessionId,
    screenSizeX:metaData.width,
    screenSizeY:metaData.height,
    metaData:metaData
  };
  let rfb = await remoteControlServiceV2.getScreen(screenElement,connexionInfo);
  remoteControlServiceV2.registerEventOnElement(screenElement);

  // Setup a POT canvas
  let canvas = rfb._canvas;
  canvas.width = metaData.width || 1024;
  canvas.height = metaData.height || 512;
  texture = new THREE.Texture(canvas);

  texture.isVideoTexture = true;
  texture.image.duration = Infinity;
  texture.image.play = () => { return Promise.resolve(true)};
  texture.update = ()=>{
    texture.needsUpdate = true;
  };
  return texture;
};
/*
export const remoteWebBrowserV1 = (screenElement,texture,mediaData) => {
  let screenSRC = mediaData.src;
  screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_PROTOCOL,"");
  screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_TRAIL,"");
  let metaData = JSON.parse(atob(screenSRC));
  let remoteScreenSessionId = metaData.sessionID;

  // Setup a POT canvas
  let canvas = document.createElement('canvas');
  canvas.width = metaData.width || 1024;
  canvas.height = metaData.height || 512;
  texture = new THREE.Texture(canvas);


  NAF.utils.getNetworkedEntity(screenElement).then(networkedEl => {
    //hovered
    //unhovered
    delete screenElement.components["hover-menu__video"];
    let screenId = networkedEl.components.networked.data.networkId;
    //singleActionButton:true;
    remoteControlService.registerEventOnElement(screenElement);
    screenElement.setAttribute("tags","singleActionButton: true;");
    remoteControlService.registerOnFrame(screenId,remoteScreenSessionId,canvas.width,canvas.height,metaData.startUrl,buffer => {
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
*/