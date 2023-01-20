import { getMSEvents } from "../../aptTeamsApp/MsTeamsUtils";
import { PROCESS_DEEPLINK } from "../Events";
import { app } from "@microsoft/teams-js";

export class DeepLinkService {
  start() {
    getMSEvents().on(PROCESS_DEEPLINK, (data) => {
      try {
        const link = data.link;
        app.openLink(link);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

export const deepLinkService = new DeepLinkService();
