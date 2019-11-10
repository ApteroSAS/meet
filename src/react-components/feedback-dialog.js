import React, { Component } from "react";
import DialogContainer from "./dialog-container.js";
import styles from "../assets/stylesheets/feedback-dialog.scss";

export default class FeedbackDialog extends Component {
  render() {
    return (
      <DialogContainer wide={true} title="" {...this.props}>
        <iframe
          className={styles.formFrame}
          src="https://aptero.co/feedback"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        >
          Loading...
        </iframe>
      </DialogContainer>
    );
  }
}
