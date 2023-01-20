import React from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../../../../react-components/input/Button";
import { useCssBreakpoints } from "react-use-css-breakpoints";

export function HaveRoomCodeButton() {
  const breakpoint = useCssBreakpoints();

  return (
    <Button
      lg={breakpoint === "sm" || breakpoint === "md"}
      xl={breakpoint !== "sm" && breakpoint !== "md"}
      preset="primary"
      style={{width: '100%'}}
      as="a" href="/link"
    >
      <FormattedMessage id="home-page.have-code" defaultMessage="Have a room code?" />
    </Button>
  );
}