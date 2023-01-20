import * as React from "react";
import { Avatar, Flex, Segment, Text } from "@fluentui/react-northstar";
import { useEffect, useState } from "react";
import { msTeamsAPI } from "@aptero/axolotis-module-teams";

export function LightProfileCard() {
  const [userProfile, setUserProfile] = useState(null) as any;
  useEffect(() => {
    // Similar to componentDidMount and componentDidUpdate:
    if (!userProfile) {
      (async () => {
        const value = await (await msTeamsAPI()).getLoginService().getTeamsLoginService().getCredential().getUserInfo();
        setUserProfile(value);
      })();
    }
  }, [userProfile]);
  const userName = userProfile ? userProfile.displayName : "Guest";
  //const preferedUserName = userProfile ? userProfile.data?.preferredUserName : "";
  return (
    <Segment style={{ padding: "3px 10px 3px 10px", width: "fit-content" }}>
      <Flex gap="gap.small">
        <Avatar
          name={userName}
          label={{
            variables: {
              backgroundColor: "pink"
            }
          }}
        />
        <Text
          content={userName}
          weight="bold"
          style={{
            textAlign: "center",
            justifyContent: "center",
            height: "100%",
            marginTop: "auto",
            marginBottom: "auto"
          }}
        />
      </Flex>
    </Segment>
  );
}
