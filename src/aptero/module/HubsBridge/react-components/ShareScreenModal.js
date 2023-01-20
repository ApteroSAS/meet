import React, { Component } from "react";
import { Modal } from "../../../../react-components/modal/Modal";
import { BackButton } from "../../../../react-components/input/BackButton";
import { FormattedMessage } from "react-intl";
import { Column } from "../../../../react-components/layout/Column";
import { ToolbarButton } from "../../../../react-components/input/ToolbarButton";
import { ReactComponent as VideoIcon } from "../../../../react-components/icons/Video.svg";
import { ReactComponent as DesktopIcon } from "../../../../react-components/icons/Desktop.svg";
import { completeEntry } from "./media-tiles-lib";

export class ShareScreenModal extends Component {
  state = {
    visible: false
  };

  componentDidMount() {
    this.sceneEl = AFRAME.scenes[0];
    this.sceneEl.addEventListener("apt-show-simple-media-select", () => {
      this.setState({ visible: true });
    });
  }

  render() {
    if (!this.state.visible) {
      return <></>;
    } else {
      return (
        <div
          style={{
            "pointer-events": "auto",
            width: "100%",
            height: "100%",
            backgroundColor: "#0000007F",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div style={{ margin: "auto", zIndex: 1 }}>
            <Modal
              style={{ minHeight: "100px" }}
              title={<FormattedMessage id="share-modal.title" defaultMessage="Share" />}
              beforeTitle={
                <BackButton
                  onClick={() => {
                    this.setState({ visible: false });
                    this.sceneEl.emit("action_selected_media_result_entry", { type: "cancel", result: "cancel" });
                  }}
                />
              }
            >
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Column padding center>
                  <ToolbarButton
                    icon={<VideoIcon />}
                    onClick={() => {
                      const entry = completeEntry({ camera: {} }, false, "result");
                      this.sceneEl.emit("action_selected_media_result_entry", { entry, selectAction: "result" });
                      this.setState({ visible: false });
                    }}
                    label={<FormattedMessage id="share-popover.source.camera" defaultMessage="Camera" />}
                    preset="accent5"
                    statusColor={"accent5"}
                  />
                </Column>
                <Column padding center>
                  <ToolbarButton
                    icon={<DesktopIcon />}
                    onClick={() => {
                      const entry = completeEntry({ shareScreen: {} }, false, "result");
                      this.sceneEl.emit("action_selected_media_result_entry", { entry, selectAction: "result" });
                      this.setState({ visible: false });
                    }}
                    label={<FormattedMessage id="share-popover.source.screen" defaultMessage="Screen" />}
                    preset="accent5"
                    statusColor={"accent5"}
                  />
                </Column>
              </div>
            </Modal>
          </div>
        </div>
      );
    }
  }
}
