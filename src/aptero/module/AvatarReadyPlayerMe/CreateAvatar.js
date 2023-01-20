import React, { Component } from "react";
import PropTypes from "prop-types";

function parse(event) {
  try {
    return JSON.parse(event.data);
  } catch (error) {
    return null;
  }
}

export default class CreateAvatar extends Component {

  static propTypes = {
    onAvatar: PropTypes.func
  };

  state = {
    done : false,
  };

  listener = (event) => {
    const json = parse(event);
    if (json?.source !== 'readyplayerme') {
      return;
    }
    console.log(json)
    const iframe = document.getElementById("iframe");
    if (json.eventName === 'v1.frame.ready') {
      iframe.contentWindow.postMessage(
          JSON.stringify({
            target: 'readyplayerme',
            type: 'subscribe',
            eventName: 'v1.**'
          }),
          '*'
      );
    }
    if (json.eventName === 'v1.avatar.exported') {
      window.removeEventListener("message", this.listener, false);
      document.removeEventListener("message", this.listener, false);
      this.props.onAvatar(event,json.data.url);
      this.setState({ done:true });
    }
  };

  componentDidMount = async () => {
    let iframe = document.getElementById("iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      document.querySelector(".container").appendChild(iframe);
    }
    iframe.id = "iframe";
    iframe.src = "https://aptero.readyplayer.me/avatar?frameApi&bodyType=halfbody";
    iframe.className = "content";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.allow = "camera *; microphone *";

    window.addEventListener("message", this.listener, false);
    document.addEventListener("message", this.listener, false);

  };

  componentWillUnmount() {
    window.removeEventListener("message", this.listener, false);
  }

  render() {
    return (
      <React.Fragment>
        {!this.state.done && <div style={{ backgroundColor: "#232323", height: "600px", minHeight: "600px", width:"100%" }} className="container"></div>}
        {this.state.done && <div style={{ backgroundColor: "#232323", height: "400px" }} className="container">Done</div>}
      </React.Fragment>
      );
  }
}
