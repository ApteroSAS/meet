import { FormattedMessage } from "react-intl";
import Button from "@material-ui/core/Button";
import React from "react";

export function customFormatSystemMessage(entry, intl) {
  let scene = document.querySelector("a-scene");
  switch (entry.type) {
    case "audio_sub_room_changed": {
      return (
        <FormattedMessage
          id="chat-sidebar-custom.system-message.audio_sub_room_changed"
          defaultMessage="You are now in audio channel {subroom}"
          values={{ subroom: <b>{entry.subroom}</b> }}
        />
      );
    }
    case "performance_impact_detected": {
      return (
        <FormattedMessage
          id="chat-sidebar-custom.system-message.performance_impact_detected"
          defaultMessage="Performance Impact on {worstDomain} is {worstScore}."
          values={{ worstDomain: entry.worstDomain,  worstScore: <b>{entry.worstScore}</b> }}
        >{txt => <>{txt}<br/> <Button color="primary" fullWidth={true} onClick={a => scene.emit("show_perf_pannel")}>Performance Pannel</Button></>}</FormattedMessage>
      );
    }
    default:
      return null;
  }
}