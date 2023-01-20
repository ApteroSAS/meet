import RemoteThumbnailRenderer from "../../thumbnail/thumbnail/RemoteThumbnailRenderer";

let thumbnailRenderer = null;

export async function processResponse(entries) {
  if (entries) {
    let previewLoadPromises = [];
    entries.forEach(entry => {
      if (!entry.url.startsWith("https://") && entry.url.startsWith("http://")) {
        entry.url = entry.url.replace("http://", "https://");//promote insecure content
      }
      if (entry.type === "room") {
        if (window.location.href.startsWith("https://localhost")) {
          entry.url = "/hub.html?hub_id=" + entry.id;
        }
      }
      if (entry.type === "model/gltf-binary") {
          if (!thumbnailRenderer) {
            thumbnailRenderer = new RemoteThumbnailRenderer();
          }

          entry.images.preview = {
            url: thumbnailRenderer.getLocalCacheFor(entry.url) || window.APP_PROPS.APP_CONFIG.GLOBAL_ASSETS_PATH+"app-thumbnail.png",
            height: 1280,
            width: 720
          };
          if(!thumbnailRenderer.getLocalCacheFor(entry.url)) {
            entry.onPreviewLoaded = new Promise((resolve, reject) => {
              thumbnailRenderer.generateThumbnailFromUrlRemote(entry.url).then(dataurl => {
                entry.images.preview.url = dataurl;
                resolve({ url: entry.url, preview: dataurl })
              }).catch(reason => {
                console.error(reason);
                resolve({ url: entry.url, preview: window.APP_PROPS.APP_CONFIG.GLOBAL_ASSETS_PATH+"app-thumbnail.png" })
              });
            });
            previewLoadPromises.push(entry.onPreviewLoaded);
          }
          entry.name = "";
      }
      if (entry.type === "avatar") {
        if (entry.id.startsWith("http")){
          entry.url = entry.id;
          entry.gltfs.avatar = entry.url;
          entry.gltfs.base = entry.url;
        }
      }
    });
    await Promise.all(previewLoadPromises);
  }

}