import * as React from "react";
import ReactDOM from "react-dom";
import registerTelemetry from "../../../../telemetry";
import Store from "../../../../storage/store";
import "../../../../utils/theme";

registerTelemetry("/microsoft-settings", "microsoft-settings");

const store = new Store();
declare const window: any;
window.APP = { store };

import { AuthContextProvider } from "../../../../react-components/auth/AuthContext";
import { ThemeProvider } from "../../../../react-components/styles/theme";
import { WrappedIntlProvider } from "../../../../react-components/wrapped-intl-provider";
import { MSettingsMain } from "../react-components/MSettingsMain";
import { getService } from "@aptero/axolotis-player";
import { MICROSOFT_STATIC_SERVICE, PROPERTIES_SERVICE } from "@aptero/axolotis-module-teams";
import { ROOM_SERVICE } from "../../axolotis/modules/basic";

const WrappedIntlProviderAny: any = WrappedIntlProvider;

export class MicrosoftSettings extends React.Component<any, { page: string }> {
  render() {
    return (
      <WrappedIntlProviderAny>
        <AuthContextProvider store={store}>
          <ThemeProvider store={store}>
            <MSettingsMain />
            <span
              onClick={() => {
                window.location.reload();
              }}
              id="version"
              style={{
                margin: 0,
                top: 0,
                left: "auto",
                right: "4px",
                bottom: "2px",
                fontSize: "0.7em",
                position: "fixed"
              }}
            >
              {process.env.BUILD_VERSION}
            </span>
          </ThemeProvider>
        </AuthContextProvider>
      </WrappedIntlProviderAny>
    );
  }
}

(async () => {
  const { initAxolotisPlayer } = await import("../../axolotis/AxInit");
  await initAxolotisPlayer();
  /*preload*/
  await getService(PROPERTIES_SERVICE);
  await getService(MICROSOFT_STATIC_SERVICE);
  await getService(ROOM_SERVICE);
  ReactDOM.render(<MicrosoftSettings />, document.getElementById("home-root"));
})();
