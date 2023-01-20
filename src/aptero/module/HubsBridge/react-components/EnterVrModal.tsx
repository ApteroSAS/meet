import React, { Component } from "react";
import { Modal } from "../../../../react-components/modal/Modal";
import { BackButton } from "../../../../react-components/input/BackButton";
import { FormattedMessage } from "react-intl";
import { Column } from "../../../../react-components/layout/Column";
import { ToolbarButton } from "../../../../react-components/input/ToolbarButton";
import { ReactComponent as DesktopIcon } from "../../../../react-components/icons/VR.svg";

declare const AFRAME: any;

export class EnterVrModal extends Component {
  state = {
    visible: false
  };

  componentDidMount() {
    const qs = new URLSearchParams(location.search);
    window.addEventListener(
      "apt_scene_entered",
      () => {
        setTimeout(() => {
          if (qs.get("vr_entry_type") === "vr_now") {
            this.setState({ visible: true });
          }
        }, 0);
      },
      { once: true }
    );
  }

  render() {
    if (!this.state.visible) {
      return <></>;
    } else {
      // @ts-ignore
      return (
        <div
          style={{
            pointerEvents: "auto",
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
              //@ts-ignore
              style={{ minHeight: "100px" }}
              title={<FormattedMessage id="vr-modal.title" defaultMessage="VR Entry" />}
              beforeTitle={
                <BackButton
                  onClick={() => {
                    this.setState({ visible: false });
                  }}
                  className={undefined}
                />
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {/*@ts-ignore*/}
                <Column padding center>
                  <div
                    style={{
                      padding: "20px"
                    }}
                  >
                    <FormattedMessage id="vr-modal.startMsg" defaultMessage="To Start Click the button below" />
                  </div>
                  <ToolbarButton
                    //@ts-ignore
                    icon={<DesktopIcon />}
                    onClick={() => {
                      AFRAME.scenes[0].enterVR();
                      this.setState({ visible: false });
                    }}
                    label={<FormattedMessage id="vr-modal.title2" defaultMessage="VR Entry" />}
                    preset="accent5"
                    statusColor={"accent5"}
                  ></ToolbarButton>
                </Column>
              </div>
            </Modal>
          </div>
        </div>
      );
    }
  }
}
