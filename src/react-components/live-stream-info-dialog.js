import React, { Component } from "react";
import PropTypes from "prop-types";
import { injectIntl} from "react-intl";

import DialogContainer from "./dialog-container.js";
import axios from "axios";

class LiveStreamInfoDialog extends Component {
  static propTypes = {
    entry: PropTypes.object
  };

  render() {
  //TODO migrate in aptero package
    /**
     {
      "attributions": "attributions",
      "id": "live-653699",
      "images": {
        "preview": {
          "height": 1280,
          "url": "https://hub.aptero.co/data/app-thumbnail.png",
          "width": 720
        }
      },
      "name": "live-653699",
      "stream": "rtmp://rtmp.aptero.co:1935/stream/live-653699",
      "type": "video/360/live",
      "url": "https://rtmp.aptero.co/live/live-653699.m3u8"
    }
     */
    return (
      <DialogContainer title={"Live Stream Info"} wide={true} {...this.props}>
        To use this live stream enter the following url in th RTMP field of your live camera:<br/>
        <b>{this.props.entry.stream}</b>
      </DialogContainer>
    );
  }
}
export default injectIntl(LiveStreamInfoDialog);
