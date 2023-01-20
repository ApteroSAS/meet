import * as AFRAME from "aframe";

const qs = new URLSearchParams(location.search);

export function isMsTeams() {
  /*if(msTeamsAPILight().msTeams()){
    //MSTeams App import causes issue
    return;
  }*/
  const qs = new URLSearchParams(location.search);
  return !!qs.get("msteams");
}

export function addEntryModeIfNotExist(entryMode: string) {
  if (isMsTeams()) {
    return;
  }

  const urlToConstruct = new URL(location.href);
  if (!urlToConstruct.searchParams.has("vr_entry_type")) {
    urlToConstruct.searchParams.set("vr_entry_type", entryMode);
    location.href = urlToConstruct.toString();
  }
}

export function getEntryMode() {
  let qsVREntryType = qs.get("vr_entry_type");
  if (isMsTeams() && !(qsVREntryType && qsVREntryType.endsWith("_now"))) {
    qsVREntryType = "2d_now";
  }
  return qsVREntryType;
}

export function duplicateEntryModeOnSrc(src: string | URL, sceneEl: AFRAME.AScene) {
  const windowUrl = new URL(location.href);
  const urlToConstruct = new URL(src);
  const isSameRoom = urlToConstruct.origin === windowUrl.origin && urlToConstruct.pathname === windowUrl.pathname;
  if (!isSameRoom) {
    if (sceneEl && sceneEl.is("vr-mode")) {
      urlToConstruct.searchParams.set("vr_entry_type", "vr_now");
    } else {
      urlToConstruct.searchParams.set("vr_entry_type", "2d_now");
    }
  }
  return urlToConstruct.toString();
}
