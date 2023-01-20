export async function setupIframeButton(t) {
  console.dir(t.src);
  const link = document.createElement('a');
  link.href = t.src;
  const allowedHosts = [
    window.location.host,
    //"hubs.mozilla.com",
    //"alphahub.aptero.co",
  ];
  let allowedSRC = false;
  for (let i = 0; i < allowedHosts.length; i++) {
    if (allowedHosts[i] === link.host)
      allowedSRC = true;
  }
  //test if url is allowed host
  if (allowedSRC) return;
  
  //doc : https://iframeable.com
  const fetchResponse = await fetch("https://iframeable.com/api/v1/?url=" + t.src);
  const json = await fetchResponse.json();
  if(!json.iframeable) return;
  
  if (t.el.parentEl.children.length > 1) return;//prevent adding buttons that already exist
  t.el.object3D.position.set(0, 0.12, 0.001);
  let iframeButton = document.createElement("a-entity");
  iframeButton.setAttribute("mixin", "rounded-text-action-button");
  iframeButton.setAttribute("position", "0 -0.12 0.001");
  iframeButton.setAttribute("is-remote-hover-target", "");
  iframeButton.setAttribute("tags", "singleActionButton: true; isHoverMenuChild: true;");
  iframeButton.setAttribute("open-iframe-button", "");
  iframeButton.innerHTML = '<a-entity text="value:Open here; width:1.5; align:center;" text-raycast-hack="" position="0 0 0.02"></a-entity>';
  t.el.parentEl.appendChild(iframeButton);

  return  "Open in tab"
}