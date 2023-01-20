import React, { Component } from "react";
import { getAdapterParams } from "../../webRTCadapter/adapter-config";

export default class ApteroRoomEditPlugin extends Component {
  static propTypes = {};

  state = {};

  componentDidMount = async () => {
  };

  componentWillUnmount() {
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {"Selected adapter : "+getAdapterParams().adapter}
        </div>
      </React.Fragment>
      );
  }
}
