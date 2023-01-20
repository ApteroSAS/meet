import * as React from "react";
import { Provider, Loader, teamsTheme } from "@fluentui/react-northstar"; //https://fluentsite.z22.web.core.windows.net/0.60.1
import { MeetingSidePanel } from "./MeetingSidePanel";
import { TabConfig } from "./TabConfig";
import { msTeamsAPI, msTeamsAPILight } from "@aptero/axolotis-module-teams";
import classNames from "classnames";
import styles from "./MSettingsMain.scss";

export class MSettingsMain extends React.Component {
  url = new URL(window.location.href);
  state = {
    page: this.url.searchParams.get("mode") || "loading"
    //Note to debug use window.location.href='https://localhost:53000/microsoft-settings.html?msteams=true&mode=sidePanel'
  };

  constructor(props: any) {
    super(props);
    (async () => {
      try {
        await (await msTeamsAPI()).getLoginService().passiveLogin();
      } catch (e) {
        console.error(e);
      } finally {
        if (this.state.page === "loading") {
          if (msTeamsAPILight().msTeams()) {
            await (
              await msTeamsAPI()
            ).getContext((context: any) => {
              //https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
              if (context.page.frameContext === "sidePanel") {
                this.setState({ page: "sidePanel" });
              } else {
                this.setState({ page: "settings" });
              }
            });
          } else {
            this.setState({ page: "no-msteams" });
          }
        }
      }
    })();
  }

  render() {
    return (
      <Provider theme={teamsTheme}>
        <div className={classNames(styles.themedBackground)}>
          {this.state.page === "loading" && <Loader />}
          {/* TODO Fix translation */}
          {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
          {this.state.page === "no-msteams" && <div>Please Open in MS Teams</div>}
          {this.state.page === "sidePanel" && <MeetingSidePanel />}
          {this.state.page === "settings" && <TabConfig />}
        </div>
      </Provider>
    );
  }
}
