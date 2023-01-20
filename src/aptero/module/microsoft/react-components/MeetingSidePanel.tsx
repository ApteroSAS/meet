import * as React from "react";
// @ts-ignore
import styles from "./MeetingSidePanel.scss";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Button, Loader } from "@fluentui/react-northstar";
import { FormattedMessage } from "react-intl";
import { msTeamsAPI, msTeamsAPILight } from "@aptero/axolotis-module-teams";
import { changeTheme } from "../../../../react-components/styles/theme.js";
import { tryMSMatchTheme } from "./MSThemeMatcher";
import { isTeamsLimitedOK } from "../TeamsLimit";

//https://fluentsite.z22.web.core.windows.net/0.60.1

export function MeetingSidePanel() {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState("mobile");
  /*const switchToRoom = async () => {
    const instanceSettings = await (await msTeamsAPI()).getTeamsApp().pages.getConfig();
    if (instanceSettings.websiteUrl) {
      let url = new URL(instanceSettings.websiteUrl); //test url valide
      url.searchParams.set("msForceHub", "true");
      window.location.replace(url.toString());
    }
  };*/
  useEffect(() => {
    (async () => {
      if (loading) {
        await tryMSMatchTheme();
        if (msTeamsAPILight().msTeams()) {
          await (
            await msTeamsAPI()
          ).getContext((context: any) => {
            const clientType = context.app.host.clientType;
            if (context.page.frameContext === "sidePanel" && (clientType === "android" || clientType === "ios")) {
              setContext("mobile");
              //switchToRoom();//This is just in case but it will not occure here since the sidepage loaded initially is hub.html
            } else {
              setContext("desktop");
            }
            setLoading(false);
          });
        }
      }
    })();
  }, [loading]);

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className={classNames(styles.sidePanelBody)}>
          {context !== "mobile" && (
            <img
              className={classNames(styles.fleche)}
              src="../../../../assets/aptero/microsoft/fleche.svg"
              /* TODO fix traduction*/
              /* eslint-disable-next-line @calm/react-intl/missing-formatted-message */
              alt="fleche"
            />
          )}
          {context !== "mobile" && <div style={{ height: "100px" }}></div>}
          <div style={{ height: "20px" }}></div>
          <main className={classNames(styles.main)}>
            <div className={classNames(styles.cubes)}>
              {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
              <img className={classNames(styles.B)} src="../../../../assets/aptero/microsoft/cubeB.svg" alt="B" />
              {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
              <img className={classNames(styles.R)} src="../../../../assets/aptero/microsoft/cubeR.svg" alt="R" />
              {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
              <img className={classNames(styles.J)} src="../../../../assets/aptero/microsoft/cubeJ.svg" alt="J" />
            </div>
            {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
            {context !== "mobile" && <p> To start your 3D meeting, click the share button on&nbsp;top of this panel</p>}
            {context !== "mobile" && (
              <p
                style={{
                  fontSize: "0.8em",
                  lineHeight: "1em",
                  fontWeight: "500"
                }}
                /* eslint-disable-next-line @calm/react-intl/missing-formatted-message */
              >
                This will start the 3D meeting for everyone
              </p>
            )}
          </main>
          <section className={classNames(styles.tuto)}>
            <div>
              {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
              <p className={classNames(styles.walk)}> Use the arrow keys to walk in the&nbsp;room </p>
              {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
              <p className={classNames(styles.look)}> Use your mouse to look around </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
