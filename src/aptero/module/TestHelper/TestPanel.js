import React, { Component } from "react";
import { selfTestService } from "./SelfTestService.module";

export default class TestPanel extends Component {

  static propTypes = {
  };

  state = {
    clients: {},
    errorDetected:false,
    consoleErrorDetected:false,
    micErrorDetected:false,
  };

  componentDidMount = async () => {
    this.setState({clients:selfTestService.clients});
    selfTestService.notifyUpdate = ()=>{
      const newState = JSON.parse(JSON.stringify(selfTestService.state));//deep copy
      if(JSON.stringify(this.state)!==JSON.stringify(newState)) {
        this.setState(newState);
      }
    }
  };

  render() {
    if(!selfTestService.isTestMode()){
      return <></>;
    }else {
      return (
        <>
          <span style={{zIndex:900,pointerEvents:"auto"}} >
            mic test
            <button id="test-start-mic-test" onClick={()=>{selfTestService.startMicTest()}}>Start</button>
            <button id="test-stop-mic-test" onClick={()=>{selfTestService.stopMicTest()}}>End</button>
          </span>
          <div style={{zIndex:900,pointerEvents:"off"}}>
            <div id="test-all-data" style={{fontSize:1}}>{JSON.stringify(this.state)}</div>
            <div>test mode : {NAF.clientId}</div>
            <div>throw error <span id="test-throw-error-state">{this.state.errorDetected?"true":"false"}</span></div>
            <div>console error <span id="test-console-error-state">{this.state.consoleErrorDetected?"true":"false"}</span></div>
            <div>mic error <span id="test-mic-error-state">{this.state.micErrorDetected?"true":"false"}</span></div>
            <div>total client seen <span id="test-clients-number">{this.state.clients?Object.keys(this.state.clients).length:0}</span></div>
            <div id="test-clients-list">
            {this.state.clients && Object.keys(this.state.clients).map(x => {
              return <div className="test-client" key={x}>{JSON.stringify(this.state.clients[x])}</div>
            })}
            </div>
          </div>
          </>
      );
    }
  }
}
