export function processResponse(entries) {
  //aptero TODO put in service
  if (entries) {
    entries.forEach(entry => {
      if (!entry.url.startsWith("https://") && entry.url.startsWith("http://")) {
        entry.url = entry.url.replace("http://", "https://");//promote insecure content
      }
      if (entry.type === "room") {
        if (window.location.href.startsWith("https://localhost")) {
          entry.url = "/hub.html?hub_id=" + entry.id;
        }
      }
      if (entry.type === "avatar") {
        if (entry.id.startsWith("http")){
          entry.url = entry.id;
          entry.gltfs.avatar = entry.url;
          entry.gltfs.base = entry.url;
        }
      }
    });
  }
}