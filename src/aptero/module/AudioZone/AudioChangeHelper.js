import { MicSetupModalContainer } from "../../../react-components/room/MicSetupModalContainer";
import React, { Component } from "react";
import { getAdapterParams } from "../webRTCadapter/adapter-config";
import {msTeamsAPILight} from "@aptero/axolotis-module-teams";

window.audioChangeHelperController = {};
window.audioChangeHelperController.spawn = () => {
  console.error("unavailable");
};
export default class AudioChangeHelper extends Component {

  state = {
    visible: false,
    micShareOk: true
  };

  componentDidMount() {
    //TODO use a listener
    if(getAdapterParams().adapter === "none" || msTeamsAPILight().msTeams()){
      this.setState({ micShareOk: false });
    }
    window.audioChangeHelperController.spawn = () => {
      if (!this.state.micShareOk) {
        this.setState({ visible: true });
      }
    };
  }

  render() {
    const muteOnEntry = window.APP.store.state.preferences["muteMicOnEntry"] || false;
    if (!this.state.visible) {
      return <></>;
    }
    return (
      <span style={{
        pointerEvents: "auto",
        maxWidth:"350px"
      }}>
        <MicSetupModalContainer
          scene={AFRAME.scenes[0]}
          selectedMicrophone={window.APP.store.state.settings.lastUsedMicDeviceId}
          microphoneOptions={window.APP.mediaDevicesManager.micDevices}
          onChangeMicrophone={deviceId => {
            if (!msTeamsAPILight().msTeams()) {
              window.APP.mediaDevicesManager.startMicShare(deviceId);
            }
            this.setState({ micShareOk: true });
          }}
          microphoneEnabled={window.APP.mediaDevicesManager.isMicShared}
          microphoneMuted={muteOnEntry}
          onChangeMicrophoneMuted={() => window.APP.store.update({ preferences: { muteMicOnEntry: !muteOnEntry } })}
          onEnterRoom={() => {
            if (!msTeamsAPILight().msTeams()) {
              window.APP.mediaDevicesManager.startMicShare(window.APP.store.state.settings.lastUsedMicDeviceId);
            }
            this.setState({ micShareOk: true });
            this.setState({ visible: false });
          }
          }
          onBack={() => {
            this.setState({ visible: false });
          }
          }
        />
      </span>
    );
  }
}