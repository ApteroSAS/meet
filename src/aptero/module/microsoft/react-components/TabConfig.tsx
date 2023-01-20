import * as React from "react";
import { Loader } from "@fluentui/react-northstar"; //https://fluentsite.z22.web.core.windows.net/0.60.1
import { FormattedMessage } from "react-intl";
import { LoginButton } from "./LoginButton";
import { RoomSection } from "./RoomSection";
import { roomService } from "../../axolotis/modules/basic";
import { CHANGE_SETTINGS_URL, MSTEAMS_QUERY_PARAM, msTeamsAPI } from "@aptero/axolotis-module-teams";
import { tryMSMatchTheme } from "./MSThemeMatcher";

/**
 * The 'Config' component is used to display your group tabs
 * user configuration options.  Here you will allow the user to
 * make their choices and once they are done you will need to validate
 * their choices and communicate that to Teams to enable the save button.
 */
export class TabConfig extends React.Component {
  fullUrl = "";
  state = {
    //url:"https://meet.aptero.co/3NKS9NY?embed_token=ae766e3d6bb6394d2aa38f69d5f1aad9&adapter=none"
    //url:"https://meet.aptero.co/3S7yY8X/kpmg-eqho?embed_token=ed66cbb7892901957af4a85bd30f2cd1"
    //url:"https://fa02-2001-861-36c3-d030-3101-4f25-21aa-393e.ngrok.io/hub.html?hub_id=fTj63Hg&msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8"
    //url:"https://alphahub.aptero.co/fTj63Hg",
    url: "",
    initialized: null,
    suggestedDisplayName: "Virtual Meeting"
  };
  removeListeners = () => {};

  componentDidMount() {
    (async () => {
      const msTeamsAPI1 = await msTeamsAPI();
      await tryMSMatchTheme();
      const loginService = msTeamsAPI1.getLoginService();
      await loginService.onReady();
      try {
        await msTeamsAPI1.getTeamsApp().app.initialize();
      } catch (e) {
        console.log("microsoftTeams.initialize failed (probably not in teams so we skip it)", e);
      }
      msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
      const instanceSettings = await (await msTeamsAPI()).getTeamsApp().pages.getConfig();
      if (instanceSettings.websiteUrl) {
        try {
          new URL(instanceSettings.websiteUrl); //test url valide
          this.setState({ url: instanceSettings.websiteUrl });
        } catch (ex) {
          console.error(ex);
        }
      }
      const callbackUrl = async (msg: { url: any }) => {
        try {
          const url = msg.url;
          this.setState({ url: url });
          const roomurl = new URL(url); //test url valide
          if (url.startsWith("https://microverse")) {
            console.log("croquet url detected");
            this.fullUrl = url;
          } else {
            const teamsParams = btoa(
              encodeURIComponent(
                JSON.stringify(await loginService.getTeamsLoginService().getCredential().getUserInfo())
              )
            );
            roomurl.searchParams.append(MSTEAMS_QUERY_PARAM, teamsParams);
            const data = (await roomService()).parseUrl(roomurl.toString());
            const token = await (await roomService()).getEmbedToken(data.roomSID, data.origin);
            roomurl.searchParams.append("embed_token", token);
            this.fullUrl = roomurl.toString();
            console.log(this.fullUrl);
          }
        } catch (ex) {
          console.error(ex);
        }
      };
      msTeamsAPI1.getMSEvents().on(CHANGE_SETTINGS_URL, callbackUrl);

      this.removeListeners = async () => {
        msTeamsAPI1.getMSEvents().off(CHANGE_SETTINGS_URL, callbackUrl);
      };
      /**
       * When the user clicks "Save", save the url for your configured tab.
       * This allows for the addition of query string parameters based on
       * the settings selected by the user.
       */
      msTeamsAPI1.getTeamsApp().pages.config.registerOnSaveHandler(async (saveEvent: { notifySuccess: () => void }) => {
        await msTeamsAPI1.getTeamsApp().pages.config.setConfig({
          suggestedDisplayName: this.state.suggestedDisplayName,
          entityId: "sceneConfig",
          contentUrl: this.fullUrl,
          websiteUrl: this.fullUrl
        });
        saveEvent.notifySuccess();
      });
      this.setState({ initialized: true });
    })();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  render() {
    /**
     * After verifying that the settings for your tab are correctly
     * filled in by the user you need to set the state of the dialog
     * to be valid.  This will enable the save button in the configuration
     * dialog.
     */
    if (this.state.url) {
      //form validation
      try {
        new URL(this.state.url);
        (async () => {
          const msTeamsAPI1 = await msTeamsAPI();
          msTeamsAPI1.getTeamsApp().pages.config.setValidityState(true);
        })();
      } catch (e) {
        //ignore error
      }
    }

    let roomUrl = this.state.url;
    try {
      roomUrl = new URL(this.state.url).origin + new URL(this.state.url).pathname;
    } catch (e) {
      //ignore error
    }

    return (
      <div style={{ margin: "8px" }}>
        {!this.state.initialized && <Loader />}
        {this.state.initialized && (
          <>
            <h2>
              <FormattedMessage id="microsoft.settings.identity" defaultMessage="Identity" />
            </h2>
            <LoginButton />
            <RoomSection
              roomUrl={roomUrl}
              suggestedDisplayName={this.state.suggestedDisplayName}
              onChangeRoomUrl={async url => {
                if (!url) {
                  await (async () => {
                    const msTeamsAPI1 = await msTeamsAPI();
                    msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
                  })();
                }
                await (await msTeamsAPI()).changeUrlSettings(url);
              }}
              onChangeSuggestedDisplayName={text => {
                this.setState({ suggestedDisplayName: text });
              }}
            />
          </>
        )}
      </div>
    );
  }
}
