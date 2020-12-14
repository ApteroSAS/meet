import React, { Component } from "react";
import PropTypes from "prop-types";

export default class CreateAvatar extends Component {

  static propTypes = {
    onAvatar: PropTypes.func
  };

  state = {
    done : false,
  };

  listener = (event) => {
    if (event.data.startsWith && event.data.startsWith("https://")) {
      window.removeEventListener("message", this.listener, false);
      this.props.onAvatar(event,event.data);
      this.setState({ done:true });
    }
  };

  componentDidMount = async () => {
    window.addEventListener("message", this.listener, false);
    let iframe = document.getElementById("iframe");
    if (iframe) {
      iframe.id = "iframe";
      iframe.src = "https://aptero.readyplayer.me/";
      iframe.className = "content";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.allow = "camera *; microphone *";
    } else {
      iframe = document.createElement("iframe");
      iframe.id = "iframe";
      iframe.src = "https://aptero.readyplayer.me/";
      iframe.className = "content";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.allow = "camera *; microphone *";
      document.querySelector(".container").appendChild(iframe);
    }
  };

  componentWillUnmount() {
    window.removeEventListener("message", this.listener, false);
  }

  render() {
    return (
      <React.Fragment>
        {!this.state.done && <div style={{ backgroundColor: "#232323", height: "600px",width:"100%" }} className="container"></div>}
        {this.state.done && <div style={{ backgroundColor: "#232323", height: "400px" }} className="container">Done</div>}
      </React.Fragment>
      );
  }
}
