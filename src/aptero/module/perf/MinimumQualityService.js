import { filterServer, getAdapterParams } from "../webRTCadapter/adapter-config";

function clampInt (value, min, max) {
  return Math.round(Math.min(Math.max(value, min), max));
}

class FpsBalancer {

  lastCalledTime = 0;
  fps = -1;
  fpsNumber = 1;
  average = 0;
  lastTestStart = performance.now();
  minimumResolution = 720;

  computeMinResolution(){
    if((screen.width / screen.height)>1){
      return {
          w: this.minimumResolution * (screen.width / screen.height),
          h: this.minimumResolution
      }
    }else{
      return {
        w: this.minimumResolution,
        h: this.minimumResolution / (screen.width / screen.height)
      }
    }
  }

  startFPSTest() {
    this.lastCalledTime = 0;
    this.fps = -1;
    this.fpsNumber = 1;
    this.average = 0;
    this.fpsTestLoop = true;
    const fpsTestLoop = () => {
      if (!this.lastCalledTime) {
        //first frame timing
        this.lastCalledTime = performance.now();
      } else {
        let delta = (performance.now() - this.lastCalledTime) / 1000;
        this.lastCalledTime = performance.now();
        this.fps = 1 / delta;
        this.average = this.average * ((this.fpsNumber - 1) / this.fpsNumber) + this.fps * (1 / this.fpsNumber);
        this.fpsNumber++;
      }
      //console.log("fps :"+ this.average + "/" + this.fps);
      if (this.fpsTestLoop) requestAnimationFrame(fpsTestLoop);

    };
    fpsTestLoop();
  }

  stopFPSTest() {
    this.fpsTestLoop = false;
    return {
      fps: this.fps,
      fpsNumber: this.fpsNumber,
      average: this.average
    };
  }

  tick() {
    if(window.APP.store.state.preferences.disableAutoPixelRatio){
      return;
    }
    try {
      if (!this.balancing) {
        return;
      }
      if (!this.fpsTestLoop && document.visibilityState !== "hidden") {
        this.startFPSTest();
        this.lastTestStart = performance.now();
      }
      if (performance.now() - this.lastTestStart > 5000) {
        let result = this.stopFPSTest();
        const deltaFPS = result.fps - 30;//between -30 and 30
        const ratio = deltaFPS / 100;//between -30% and 30%
        if (result.fps < 25 || result.fps >= 45) {
          this.changeResolution(1 + ratio);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  startBalancing() {
    this.balancing = true;
    const preferences = window.APP.store.state.preferences;
    if (preferences.maxResolutionWidth > window.screen.width || preferences.maxResolutionHeight > window.screen.height) {
      let newWidth = clampInt(preferences.maxResolutionWidth, this.computeMinResolution().w, window.screen.width);
      let newHeight = clampInt(preferences.maxResolutionHeight, this.computeMinResolution().h, window.screen.height);
      window.APP.store.update({
        preferences: { maxResolutionWidth: newWidth, maxResolutionHeight: newHeight }
      });
    }
    // startSimulation and pauseSimulation defined elsewhere
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.stopFPSTest();
      }
    }, false);
  }

  changeResolution(ratio) {
    const preferences = window.APP.store.state.preferences;
    let newWidth = clampInt((preferences.maxResolutionWidth * ratio) || window.screen.width, this.computeMinResolution().w, window.screen.width);
    let newHeight = clampInt((preferences.maxResolutionHeight * ratio) || window.screen.height, this.computeMinResolution().h, window.screen.height);
    if (preferences.maxResolutionWidth !== newWidth || preferences.maxResolutionHeight !== newHeight) {
      preferences.maxResolutionWidth = newWidth;
      preferences.maxResolutionHeight = newHeight;
      window.APP.store.update({
        preferences: { maxResolutionWidth: newWidth, maxResolutionHeight: newHeight }
      });
      console.log("FPS",{
        fps: this.fps,
        fpsNumber: this.fpsNumber,
        average: this.average
      });
      console.log("change resolution:" + ratio + " / " + preferences.maxResolutionWidth + " / " + preferences.maxResolutionHeight);
    }
  }
}

class MinimumQualityService {

  /*
  check udp connexion
  check mic activities
  check fps activities
  */

  globalIssueDetected = {
    "fps-issue": false,
    "turn-udp-issue": false,
    "turn-tcp-issue": false,
    "mic-activity-issue": false,
    "has-reloaded-issue": false
  };

  constructor() {
    this.fpsBalancer = new FpsBalancer();
    this.notifyMicChanged();//for default mic
  }

  tick() {
    this.fpsBalancer.tick();
  }

  initialCheckFinished() {
    this.fpsBalancer.startBalancing();//TODO deactivate
  }

  getCheckStatus() {
    this.stopFPSTest();
    return this.globalIssueDetected;
  }

  getErrorDetected() {
    let issue = false;
    Object.keys(this.globalIssueDetected).forEach(key => {
      if (this.globalIssueDetected[key]) {
        issue = true;
      }
    });
    return issue;
  }

  async checkTurnServerAndSwitchToTCP(iceServer) {
    let filterServer1 = filterServer(iceServer, false);
    let udpOk = await this.checkTurnServer(filterServer1);
    if (!udpOk) {
      this.globalIssueDetected["turn-udp-issue"] = true;
      console.warn("turn-udp-issue detected");
      let filterServer1 = filterServer(iceServer, true);
      let tcpOk = await this.checkTurnServer(filterServer1);
      if (!tcpOk) {
        this.globalIssueDetected["turn-tcp-issue"] = true;
        console.warn("turn-tcp-issue detected");
      }
      //troubleshoot
      //if tcp is ok we restart the page in tcp mode
      if (!udpOk && tcpOk) {
        console.warn("switching to TCP mode");
        const url = new URL(window.location.toString());
        if (!url.searchParams.get("force_tcp")) {
          url.searchParams.set("force_tcp", true);
          window.location.href = url.toString();
        }
      }
    } else {
      /* everythings good*/
    }
  }

  async checkTurnServer(iceServers, timeout) {
      if(!["dialog-io-data-only","naf-socketio-adapter"].includes(getAdapterParams().adapter)){
        return true;
      }
    return new Promise((resolve) => {
      let promiseResolved = false;
      setTimeout(() => {
        if (promiseResolved) return;
        resolve(false);
        promiseResolved = true;
      }, timeout || 3000);

      let myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
      let pc = new myPeerConnection({ iceServers: iceServers });
      let noop = function() {
      };
      pc.createDataChannel("");    //create a bogus data channel
      pc.createOffer(function(sdp) {
        if (sdp.sdp.indexOf("typ relay") > -1) { // sometimes sdp contains the ice candidates...
          promiseResolved = true;
          resolve(true);
        }
        pc.setLocalDescription(sdp, noop, noop);
      }, noop);    // create offer and set local description
      pc.onicecandidate = (ice) => {  //listen for candidate events
        if (promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf("typ relay") > -1)) return;
        promiseResolved = true;
        resolve(true);
      };
    });
  }

  MIN_VOLUME_THRESHOLD = 0.0075;

  notifyMicLevel(micLevel) {
    if (micLevel > this.MIN_VOLUME_THRESHOLD) {
      this.globalIssueDetected["mic-activity-issue"] = false;
    }
  }

  notifyMicChanged() {
    this.globalIssueDetected["mic-activity-issue"] = true;
  }

  startFPSTest() {
    this.globalIssueDetected["fps-issue"] = false;
    this.fpsBalancer.startFPSTest();
  }

  stopFPSTest() {
    let result = this.fpsBalancer.stopFPSTest();
    if (result.average < 25 && result.fpsNumber > 25) {
      //fps number > than 25 at 25 fps means at least one second of measurement
      this.globalIssueDetected["fps-issue"] = true;
    }
  }
}

export const minimumQualityService = new MinimumQualityService();
