import React from "react";
import { defineMessage, useIntl } from "react-intl";
import { ReactComponent as MoreIcon } from "../../../../react-components/icons/More.svg";
import styles from "./CustomPopoverButton.scss";

const customPopoverTitle = defineMessage({
  id: "custom-popover.title",
  defaultMessage: "Custom"
});

export function CustomPopoverButton() {
  const intl = useIntl();

  return (
    <button
      className={styles.compactButton}
      aria-label={intl.formatMessage(customPopoverTitle)}
      onClick={e => {}}
    >
      <MoreIcon />
    </button>
  );
}

CustomPopoverButton.propTypes = {};
