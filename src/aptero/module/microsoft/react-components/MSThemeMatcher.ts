import { changeTheme } from "../../../../react-components/styles/theme";
import { msTeamsAPI, msTeamsAPILight } from "@aptero/axolotis-module-teams";

export async function tryMSMatchTheme() {
  if (msTeamsAPILight().msTeams()) {
    await (
      await msTeamsAPI()
    ).getContext((context: any) => {
      //https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context?tabs=teamsjs-v2
      try {
        changeTheme(context.app.theme === "default" ? "light-default" : "dark-default");
      } catch (e) {
        setTimeout(() => {
          changeTheme(context.app.theme === "default" ? "light-default" : "dark-default");
        }, 2000);
      }
    });
  }
}
