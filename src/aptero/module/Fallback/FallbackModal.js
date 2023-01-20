import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../react-components/modal/Modal";
import { Button } from "../../../react-components/input/Button";
import { BackButton } from "../../../react-components/input/BackButton";
import { FormattedMessage } from "react-intl";
import { Column } from "../../../react-components/layout/Column";
import { remoteControlServiceV2 } from "../RemoteScreen/RemoteControlServiceV2";
import { minimumQualityService } from "../perf/MinimumQualityService";

export function fallbackVMButton(){
  return <>
    <Button preset="accept" onClick={async ()=>{
      window.location.href = await remoteControlServiceV2.generateFallBackUrl();
    }
    }>
      <FormattedMessage id="fallback-modal.enter-room-error-button-compatibility" defaultMessage="Restart in compatibility mode"/>
    </Button>
  </>
}

export function fallbackTCPButton(){
  const tcpUrl = new URL(window.location.toString());
  tcpUrl.searchParams.set("force_tcp", true);
  return <>
    <Button preset="accept" onClick={async ()=>{
      window.location.href = tcpUrl.toString();
    }
    }>
      <FormattedMessage id="fallback-modal.enter-room-error-button-tcp" defaultMessage="Restart in TCP mode"/>
    </Button>
  </>
}

export function comboFallbackButton(){
  return <>{
    fallbackVMButton()
  }{
    fallbackTCPButton()
  }
  </>
}

export function FallbackModal({ className, onEnterRoom, onBack, ...rest }) {
  const status = minimumQualityService.getCheckStatus();
  return (
      <Modal
          title={<FormattedMessage id="mic-permissions-modal.title" defaultMessage="Issue panel"/>}
          beforeTitle={<BackButton onClick={onBack}/>}
          className={className}
          {...rest}
      >
        <Column padding center>
          {status["turn-udp-issue"] || status["turn-tcp-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="fallback-modal.turn-issue"
                defaultMessage="Connectivity issue detected other user won't be able to hear you"
            />
          </div>}
          {status["mic-activity-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="fallback-modal.mic-activity-issue"
                defaultMessage="No sound detected coming from your microphone press back and try to change microphone."
            />
          </div>}
          {status["fps-issue"] &&
          <div style={{ color: "red" }}>
            <FormattedMessage
                id="fallback-modal.fps-issue"
                defaultMessage="Your PC does not seems to have the required performance to be able to run application."
            />
          </div>}
          {/*(status["fps-issue"] || status["turn-udp-issue"] || status["turn-tcp-issue"] || status["mic-activity-issue"]) &&
            fallbackVMButton()
          */}
          <>
            <Button preset="accept" onClick={onEnterRoom}>
              <FormattedMessage id="fallback-modal.enter-room-button-anyway" defaultMessage="Enter Room Anyway"/>
            </Button>
          </>
        </Column>
      </Modal>
  );
}

FallbackModal.propTypes = {
  className: PropTypes.string,
  onEnterRoom: PropTypes.func,
  onBack: PropTypes.func
};
