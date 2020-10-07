import React from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../../react-components/input/Button";

export function HaveARoomCodeButton() {
  return (
    <React.Fragment>
      <br/>
      <Button
        primary
        cta
        onClick={e => {
          e.preventDefault();
          window.location.href = window.location.origin + "/link";
        }}
      >
        <FormattedMessage id="home.have_code"/>
      </Button>
    </React.Fragment>
  );
}
