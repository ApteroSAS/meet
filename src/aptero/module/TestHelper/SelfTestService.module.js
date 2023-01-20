import qsTruthy from "../../../utils/qs_truthy";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { getMicrophonePresences } from "../../../utils/microphone-presence";

//TODO detect for others
// [done] connected / disconected
// mic on before the end

// TODO detect for myself
// [done] trow error
// [done] console error??
// global status ok or not

/**
 *
 */
window.countActiveVideoTag= async ()=>{
  let count = 0;
  window.elementVideo.forEach(value => {
    if(value.src || value.srcObject){
      count++;
    }
  });
  return count;
};
function createTagInspectorSetup(){
  if(!window.elementVideo){
    window.elementVideo=[];
  }
  const old = document.createElement;
  document.createElement = (kind,args)=>{
    const el = old(kind,args);
    if(kind==="video") {
      console.log("create :", kind);
      window.elementVideo.push(el);
    }
    return el;
  }
}
createTagInspectorSetup();

/**
 *
 */

export class SelfTestServiceModule {
  state = {
    clients: {},
    errorDetected: false,
    consoleErrorDetected: false,
    micErrorDetected: false
  };
  notifyUpdate = () => {
  };

  constructor() {
    this.testMode = qsTruthy("test");
    if (this.testMode) {
      const self = this;
      const oldcerr = console.error;
      console.error = (data1, ...data) => {
        this.state.consoleErrorDetected = true;
        self.notifyUpdate();
        oldcerr(data1, data);
      };
      window.addEventListener("error", () => {
        this.state.errorDetected = true;
        self.notifyUpdate();
      });

      waitForDOMContentLoaded().then(() => {
        /*document.body.addEventListener("clientConnected", (evt) => {
          console.log("clientConnected", evt);
          let clientID = evt.detail.clientId;
          if (clientID !== NAF.clientId) {
            this.createClient(clientID);
            self.notifyUpdate();
          }
        });*/
        document.body.addEventListener("clientDisconnected", (evt) => {
          console.log("clientDisconnected", evt);
          let clientID = evt.detail.clientId;
          if (clientID !== NAF.clientId && this.state.clients[clientID]) {
            this.state.clients[clientID].connected = false;
            self.notifyUpdate();
          }
        });
      });
    }
  }

  updateAllFromPresence() {
    const state = window.APP.hubChannel.presence.state;
    Object.keys(state).forEach(clientID => {
      if (clientID !== NAF.clientId) {
        const profile = state[clientID].metas[0].profile;
        if (profile.displayName && profile.displayName.startsWith("TEST_BOT_")) {
          this.createClient(clientID);
          this.state.clients[clientID].displayName = profile.displayName;
          this.state.clients[clientID].identityName = profile.identityName;
        }
      }
    });
    this.notifyUpdate();
  }

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  notifySceneEntered() {
    if (this.testMode) {
      setInterval(()=>{
        this.updateAllFromPresence();
      },1000);
      AFRAME.scenes[0].addEventListener("presence_updated", (e) => {
        this.updateAllFromPresence();
        //special part to be sure to have the name
        if (e.detail.profile && e.detail.sessionId !== NAF.clientId &&
          e.detail.profile.displayName &&
          e.detail.profile.displayName.startsWith("TEST_BOT_")
        ) {
          this.createClient(e.detail.sessionId);
          this.state.clients[e.detail.sessionId].displayName = e.detail.profile.displayName;
        }
        this.notifyUpdate();
      });

      this.updateAllFromPresence();

      setTimeout(() => {
        if (!window.APP.store.state.profile.displayName.startsWith("TEST_BOT_")) {
          window.APP.store.update({
            profile: {
              displayName: "TEST_BOT_" + this.getRndInteger(100000, 900000)
            }
          });
          AFRAME.scenes[0].emit("avatar_updated");
        }
      }, 500);
    }
  }

  createClient(id) {
    if (NAF.clientId) {
      delete this.state.clients[NAF.clientId];
    }
    if (id === NAF.clientId) {
      return;
    }
    if (!this.state.clients[id]) {
      this.state.clients[id] = { id: id, connected: true };
    }
  }

  onUpdate(callback) {
    this.notifyUpdate = callback;
  }

  isTestMode() {
    return this.testMode;
  }

  startSelfTest() {
    if (this.testMode) {
      console.log("TEST MODE ENABLED");
      waitForDOMContentLoaded().then(() => {
        window.APP.store.state.preferences.showFPSCounter = true;
      });
    }
  }

  startMicTest() {
    //reset mic state
    this.micTestInProgress = true;
    Object.keys(this.state.clients).forEach(key => {
      this.state.clients[key].micTest = false;
    });
    this.notifyUpdate();
  }

  stopMicTest() {
    this.micTestInProgress = false;
    Object.keys(this.state.clients).forEach(key => {
      if (!this.state.clients[key].micTest && this.state.clients[key].displayName.startsWith("TEST_BOT_")) {
        this.state.micErrorDetected = true;
      }
    });
    this.notifyUpdate();
  }

  tick() {
    if (this.micTestInProgress) {
      const micPresences = getMicrophonePresences();
      micPresences.forEach((presence, key) => {
        if (presence.talking && key !== NAF.clientId && this.state.clients[key].connected) {
          this.state.clients[key].micTest = true;
        }
      });
    }
  }
}

export const selfTestService = new SelfTestServiceModule();
