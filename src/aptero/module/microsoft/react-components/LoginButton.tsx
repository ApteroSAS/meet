import * as React from "react";
import { Button, Loader } from "@fluentui/react-northstar";
import { LightProfileCard } from "./LightProfileCard";
import { FormattedMessage } from "react-intl";
import { useEffect, useState } from "react";
import { MicrosoftLoginService, msTeamsAPI } from "@aptero/axolotis-module-teams";

// eslint-disable-next-line no-unused-vars
export function LoginButton(props: any) {
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<MicrosoftLoginService>();
  const [error, setError] = useState(null);
  useEffect(() => {
    // Similar to componentDidMount and componentDidUpdate:
    (async () => {
      setService(await (await msTeamsAPI()).getLoginService());
      setLoading(false);
    })();
  }, []);

  const requestAuth = async () => {
    try {
      console.log("1");
      setLoading(true);
      setError(null);
      await service?.login(false);
      setLoading(false);
      console.log("2");
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };
  //https://docs.microsoft.com/en-us/graph/toolkit/components/person-card
  return (
    <>
      {!loading && (
        <div style={{ margin: "8px" }}>
          {service && service.isSignedIn() && <LightProfileCard />}
          {error && (
            <p>
              <FormattedMessage
                id="microsoft.settings.account-auth.authorize1"
                defaultMessage="Failed to authorize. Please contact the support at admin@aptero.co and past the following error detail:"
              />
              <br /> {(error as Error).toString()}
            </p>
          )}
          {/*!error && <><p><FormattedMessage id="microsoft.settings.account-auth.authorize2"
                                          defaultMessage="(Optional) Authorize this app to access advanced features."/>
          </p>
            <Button primary content="Authorize" disabled={loading} onClick={requestAuth}
            style={{height: "auto"}}/></>
          */}
          <br />
          {service && !service.isSignedIn() && (
            <Button
              primary
              content="Sign In"
              disabled={loading}
              onClick={async () => {
                await requestAuth();
              }}
              style={{ height: "auto" }}
            />
          )}

          {service && service.isSignedIn() && (
            <Button
              primary
              content="Sign Out"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  await service.logout();
                  setLoading(false);
                } catch (e) {
                  setError(e);
                  setLoading(false);
                }
              }}
              style={{ height: "auto" }}
            />
          )}
        </div>
      )}
      {loading && <Loader />}
    </>
  );
}
