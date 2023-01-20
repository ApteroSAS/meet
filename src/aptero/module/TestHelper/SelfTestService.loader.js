import qsTruthy from "../../../utils/qs_truthy";
import React, { Component, Suspense } from "react";

const testMode = qsTruthy("test");

export async function startSelfTest() {
  if (testMode) {
    const selfTestService = (await import("./SelfTestService.module"));
    selfTestService.selfTestService.startSelfTest();
  }
}

export async function testServiceNotifySceneEntered() {
  if (testMode) {
    const selfTestService = (await import("./SelfTestService.module"));
    selfTestService.selfTestService.notifySceneEntered();
  }
}

export async function testTick() {
  if (testMode) {
    const selfTestService = (await import("./SelfTestService.module"));
    selfTestService.selfTestService.tick();
  }
}


const TestPanel = React.lazy(() => import("./TestPanel"));

export default class TestPanelLazy extends Component {
  componentDidMount = async () => {
  };

  render() {
    if (!testMode) {
      return <></>;
    } else {
      return <Suspense fallback={<div>loading ...</div>}>
        <TestPanel/>
      </Suspense>;
    }
  }
}
