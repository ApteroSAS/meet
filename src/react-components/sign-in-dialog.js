import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "../assets/stylesheets/sign-in-dialog.scss";
import DialogContainer from "./dialog-container";
import SignInMailDialog from "./sign-in-mail-dialog";
import { microsoftService } from "../aptero/service/MicrosoftService";

export default class SignInDialog extends Component {
  static propTypes = {
    authStarted: PropTypes.bool,
    authComplete: PropTypes.bool,
    onSignIn: PropTypes.func,
    onContinue: PropTypes.func,
    message: PropTypes.string,
    continueText: PropTypes.string,
    closable: PropTypes.bool
  };

  state={
    showMail:false
  }

  static defaultProps = {
    closable: true
  };

  render() {
    return (
      <DialogContainer title="Sign In" {...this.props}>
        <button className={styles.nextButton} onClick={()=>{microsoftService.loginWithRedirect()}}>
          Sign In Using Microsoft
        </button>
        <br/>
        <button className={styles.nextButton} onClick={()=>{
          this.setState({showMail:true})
        }}>
          Sign In Using Mail
        </button>
        {this.state.showMail &&
        <SignInMailDialog {...this.props} />
        }
      </DialogContainer>
    );
  }
}
