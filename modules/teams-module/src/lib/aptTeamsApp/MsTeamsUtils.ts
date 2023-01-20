import { getServiceSync } from "@aptero/axolotis-player";

const EventEmitter = require("eventemitter3");

import { MICROSOFT_STATIC_SERVICE } from "../index";
import { MsTeamsAPILight } from "../microsoft/MsTeamsAPILight";
import { CHANGE_SETTINGS_URL, PROCESS_DEEPLINK } from "../microsoft/Events";
import { app } from "@microsoft/teams-js";

let eventListener = new EventEmitter();

export function sendEvent(type, data) {
  eventListener.emit(type, data);
}

export function getMSEvents() {
  return eventListener;
}

export function msTeamsUtils() {
  return getServiceSync<MsTeamsAPILight>(MICROSOFT_STATIC_SERVICE).msTeams();
}

export function changeUrlSettings(url) {
  sendEvent(CHANGE_SETTINGS_URL, { url });
}

export async function getContext(callback: (context: app.Context) => void) {
  try {
    try {
      await app.initialize();
    } catch (e) {
      callback(null);
      console.warn("microsoftTeams.initialize failed (probably not in teams so we skip it)", e);
      return;
    }
    // https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
    //"frameContext": "The context where tab URL is loaded (for example, content, task, setting, remove, sidePanel)",
    const context = await app.getContext();
    callback(context);
  } catch (e) {
    console.error(e);
  }
}

export function processDeepLink(link) {
  if (msTeamsUtils()) {
    sendEvent(PROCESS_DEEPLINK, { link });
  } else {
    window.open(link, "_blank");
  }
}
