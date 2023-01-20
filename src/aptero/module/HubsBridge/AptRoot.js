import React, { Component } from "react";
import AptStyles from "./AptStyles";
import TestPanelLazy from "../TestHelper/SelfTestService.loader";
import { ShareScreenModal } from "./react-components/ShareScreenModal";
import AudioChangeHelper from "../AudioZone/AudioChangeHelper";
import GaugeModal from "../perf/Gauge/react-component/GaugeModal";
import UnderPage from "./react-components/UnderPage";
import { EnterVrModal } from "./react-components/EnterVrModal";

export default class AptRoot extends Component {
  render() {
    return (<>
        <TestPanelLazy/>
        <ShareScreenModal onBack={() => {
        }}/>
        <AudioChangeHelper/>
        <GaugeModal/>
        <UnderPage/>
        <EnterVrModal />
        <AptStyles/>
      </>
    );
  }
}
