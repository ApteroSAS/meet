import { TwilioAdapter } from "./twilio";
import EventEmitter from "eventemitter3";
import { ProtooHelper } from "./protoHelper";
import AdapterUserListener from "./AdapterUserListener";

// NOTE this adapter does not properly fire the onOccupantsReceived events since those are only needed for
// data channels, which are not yet supported. To fire that event, this class would need to keep a list of
// occupants around and manage it.
//
// Used for VP9 webcam video.

let debug = console.log;
let error = console.error;
let info = console.log;

declare const window: any;

export const DIALOG_CONNECTION_ERROR_FATAL = "dialog-connection-error-fatal";
export default class NafTwilioAdapter extends EventEmitter {
  private _micProducer: any;
  private _cameraProducer: any;
  private _shareProducer: any;
  private _localMediaStream: any;
  private _consumers: Map<any, any>;
  private _pendingMediaRequests: Map<any, any>;
  private _blockedClients: Map<any, any>;
  private _forceTcp: boolean;
  private _forceTurn: boolean;
  private _iceTransportPolicy: any;
  private scene: any;
  private _serverParams: any;
  private adapterUserListener: any;
  private _consumerStats: any;
  private _serverUrl: any;
  private _clientId: any;
  private _roomId: any;
  private _joinToken: any;
  private subAdapter: TwilioAdapter;
  private _closed: boolean;
  private _micEnabled: Boolean;
  private _micShouldBeEnabled: boolean;
  private lastTrack = null;

  constructor() {
    super();
    this._micProducer = null;
    this._cameraProducer = null;
    this._shareProducer = null;
    this._localMediaStream = null;
    this._consumers = new Map();
    this._pendingMediaRequests = new Map();
    this._blockedClients = new Map();
    this._forceTcp = false;
    this._forceTurn = false;
    this._iceTransportPolicy = null;
    this.scene = null;
    this._serverParams = {};
    this._consumerStats = {};
    this.adapterUserListener = new AdapterUserListener();
  }

  get consumerStats() {
    return this._consumerStats;
  }

  /**
   * Gets transport/consumer/producer stats on the server side.
   */
  async getServerStats() {
    return {};
  }
  // eslint-disable-next-line no-unused-vars
  async iceRestart(transport: any) {}

  // eslint-disable-next-line no-unused-vars
  async recreateSendTransport(iceServers: any) {}

  /**
   * Restart ICE in the underlying send peerconnection.
   */
  async restartSendICE() {}

  /**
   * Checks the Send Transport ICE status and restarts it in case is in failed state.
   * This is called by the Send Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connnection state (ICE connection state)
   */
  // eslint-disable-next-line no-unused-vars
  checkSendIceStatus(connectionState: any) {}

  // eslint-disable-next-line no-unused-vars
  async recreateRecvTransport(iceServers: any) {}

  /**
   * Restart ICE in the underlying receive peerconnection.
   * @param {boolean} force Forces the execution of the reconnect.
   */
  async restartRecvICE() {}

  /**
   * Checks the ReeceiveReeceive Transport ICE status and restarts it in case is in failed state.
   * This is called by the Reeceive Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connection state (ICE connection state)
   */
  // eslint-disable-next-line no-unused-vars
  checkRecvIceStatus(connectionState: boolean) {}

  async reconnect() {
    await this.disconnect();

    await new Promise(resolve => setTimeout(resolve, 4000));
    await this.connect({
      serverUrl: this._serverUrl,
      roomId: this._roomId,
      joinToken: this._joinToken,
      serverParams: this._serverParams,
      clientId: this._clientId,
      scene: this.scene,
      forceTcp: this._forceTcp,
      forceTurn: this._forceTurn,
      iceTransportPolicy: this._iceTransportPolicy
    });
  }

  // @ts-ignore
  async connect({
    // @ts-ignore
    serverUrl,
    // @ts-ignore
    roomId,
    // @ts-ignore
    joinToken,
    // @ts-ignore
    serverParams,
    // @ts-ignore
    scene,
    // @ts-ignore
    clientId,
    // @ts-ignore
    forceTcp,
    // @ts-ignore
    forceTurn,
    // @ts-ignore
    iceTransportPolicy
  }) {
    this._serverUrl = serverUrl;
    this._roomId = roomId;
    this._joinToken = joinToken;
    this._serverParams = serverParams;
    this._clientId = clientId;
    this.scene = scene;
    this._forceTcp = forceTcp;
    this._forceTurn = forceTurn;
    this._iceTransportPolicy = iceTransportPolicy;

    this.subAdapter = new TwilioAdapter(this.adapterUserListener);
    this.subAdapter.setOnTrack(
      (track: { appData: { peerId: any }; track: MediaStreamTrack }, peerId: any, trackid: any) => {
        //RemoteAudioTrack
        console.log("Add consumer:", track);
        track.appData = { peerId };
        this._consumers.set(trackid, track);
        this.resolvePendingMediaRequestForTrack(peerId, track.track);
      }
    );
    this.subAdapter.setOnTrackRemoved((trackId: any) => {
      this._consumers.delete(trackId);
    });
    this.subAdapter.setOnParticipantDisconnected((peerId: any) => {
      this._consumers.forEach(consumer => {
        if (consumer.appData.peerId === peerId && "video" === consumer.track.kind) {
          this.subAdapter.unpublishGivenVideoTrack(consumer);
        }
      });
    });
    await this.subAdapter.connectRoom(this._clientId, this._roomId);

    const urlWithParams = new URL(this._serverUrl);
    urlWithParams.searchParams.append("roomId", this._roomId);
    urlWithParams.searchParams.append("peerId", this._clientId);

    this._closed = false;

    return new Promise(async (resolve, reject) => {
      try {
        await this._joinRoom();
        if (this.lastTrack) {
          this.createTrack(this.lastTrack);
        }
        resolve(true);
      } catch (err) {
        this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${error}`);
        reject(err);
      }
    });
  }

  async _retryConnectWithNewHost() {
    this.cleanUpLocalState();
    const serverParams = await window.APP.hubChannel.getHost();
    const { host, port } = serverParams;
    const newServerUrl = `wss://${host}:${port}`;
    if (this._serverUrl === newServerUrl) {
      console.error("Reconnect to dialog failed.");
      this.emit(DIALOG_CONNECTION_ERROR_FATAL);
      return;
    }
    console.log(`The Dialog server has changed to ${newServerUrl}, reconnecting with the new server...`);
    await this.connect({
      serverUrl: newServerUrl,
      roomId: this._roomId,
      joinToken: window.APP.hubChannel.token,
      serverParams,
      scene: this.scene,
      clientId: this._clientId,
      forceTcp: this._forceTcp,
      forceTurn: this._forceTurn,
      iceTransportPolicy: this._iceTransportPolicy
    });
  }

  closePeer(peerId: any) {
    const pendingMediaRequests = this._pendingMediaRequests.get(peerId);

    if (pendingMediaRequests) {
      const msg = "The user disconnected before the media stream was resolved.";
      info(msg);

      if (pendingMediaRequests.audio) {
        pendingMediaRequests.audio.resolve(null);
      }

      if (pendingMediaRequests.video) {
        pendingMediaRequests.video.resolve(null);
      }

      this._pendingMediaRequests.delete(peerId);
    }
  }

  resolvePendingMediaRequestForTrack(clientId: any, track: MediaStreamTrack) {
    const requests = this._pendingMediaRequests.get(clientId);

    if (requests && requests[track.kind]) {
      const resolve = requests[track.kind].resolve;
      delete requests[track.kind];
      resolve(new MediaStream([track]));
    }

    if (requests && Object.keys(requests).length === 0) {
      this._pendingMediaRequests.delete(clientId);
    }
  }

  removeConsumer(consumerId: any) {
    this.emitRTCEvent("info", "RTC", () => `Consumer removed: ${consumerId}`);
    this._consumers.delete(consumerId);
  }

  getMediaStream(clientId: any, kind = "audio") {
    let track;

    if (this._clientId === clientId) {
      if (kind === "audio" && this._micProducer) {
        track = this._micProducer.track;
      } else if (kind === "video") {
        if (this._cameraProducer && !this._cameraProducer.closed) {
          track = this._cameraProducer.track;
        } else if (this._shareProducer && !this._shareProducer.closed) {
          track = this._shareProducer.track;
        }
      }
    } else {
      this._consumers.forEach(consumer => {
        if (consumer.appData.peerId === clientId && kind == consumer.track.kind) {
          track = consumer.track;
        }
      });
    }

    if (track) {
      debug(`Already had ${kind} for ${clientId}`);
      return Promise.resolve(new MediaStream([track]));
    } else {
      debug(`Waiting on ${kind} for ${clientId}`);
      if (!this._pendingMediaRequests.has(clientId)) {
        this._pendingMediaRequests.set(clientId, {});
      }

      const requests = this._pendingMediaRequests.get(clientId);
      const promise = new Promise((resolve, reject) => (requests[kind] = { resolve, reject }));
      requests[kind].promise = promise;
      promise.catch(e => {
        this.emitRTCEvent("error", "Adapter", () => `getMediaStream error: ${e}`);
        console.warn(`${clientId} getMediaStream Error`, e);
      });
      return promise;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async createSendTransport(iceServers: any) {
    // Create mediasoup Transport for sending (unless we don't want to produce).
  }

  async closeSendTransport() {}

  // eslint-disable-next-line no-unused-vars
  async createRecvTransport(iceServers: any) {
    // Create mediasoup Transport for sending (unless we don't want to consume).
  }

  async closeRecvTransport() {}

  async _joinRoom() {
    debug("_joinRoom()");
    if (this._localMediaStream) {
      // TODO: Refactor to be "Create producers"
      await this.setLocalMediaStream(this._localMediaStream);
      this.enableMicrophone(this._micShouldBeEnabled); //use last state for mic (useful for fast room switching)
    }
  }

  async setLocalMediaStream(stream: { getTracks: () => MediaStreamTrack[] }) {
    this.emitRTCEvent("info", "RTC", () => `Creating missing producers`);
    let sawAudio = false;
    let sawVideo = false;

    await Promise.all(
      stream.getTracks().map(async (track: MediaStreamTrack) => {
        if (track.kind === "audio") {
          sawAudio = true;

          // TODO multiple audio tracks?
          if (this._micProducer) {
            if (this._micProducer.track !== track) {
              this._micProducer.track.stop();
              //this._micProducer.replaceTrack(track);
            }
          } else {
            if (!this._micEnabled) {
              track.enabled = false;
            }

            // stopTracks = false because otherwise the track will end during a temporary disconnect
            this._micProducer = { track };
          }
        } else {
          sawVideo = true;

          // @ts-ignore
          if (track._hubs_contentHint === "share") {
            await this.disableCamera();
            await this.enableShare(track);
          } else {
            // @ts-ignore
            if (track._hubs_contentHint === "camera") {
              await this.disableShare();
              await this.enableCamera(track);
            }
          }
        }

        this.resolvePendingMediaRequestForTrack(this._clientId, track);
      })
    );

    if (!sawAudio && this._micProducer) {
      this._micProducer.close();
      this._micProducer = null;
    }
    if (!sawVideo) {
      this.disableCamera();
      this.disableShare();
    }
    this._localMediaStream = stream;
  }

  async enableCamera(track: any) {
    this._cameraProducer = { track };
  }

  async disableCamera() {
    if (!this._cameraProducer) return;
    this._cameraProducer = null;
    return await this.subAdapter.disableCamera();
  }

  async enableShare(track: any) {
    this._shareProducer = { track };
  }

  async disableShare() {
    if (!this._shareProducer) return;
    this._shareProducer = null;
    return await this.subAdapter.disableShare();
  }

  toggleMicrophone() {
    if (this.isMicEnabled) {
      this.enableMicrophone(false);
    } else {
      this.enableMicrophone(true);
    }
  }

  enableMicrophone(enabled: boolean) {
    this.subAdapter.enableMicrophone(enabled);
    this._micShouldBeEnabled = enabled;
    this.emit("mic-state-changed", { enabled: this.isMicEnabled });
  }

  get isMicEnabled() {
    if (!this.subAdapter) {
      return false;
    }
    return this.subAdapter.isMicEnabled();
  }

  cleanUpLocalState() {
    this._micProducer = null;
    this._shareProducer = null;
    this._cameraProducer = null;
  }

  disconnect() {
    if (this.subAdapter) {
      this.subAdapter.disconnect();
    }
    if (this._closed) return;

    debug("disconnected()");
    this.cleanUpLocalState();
    this.adapterUserListener.disconnect();
  }

  kick(clientId: any, permsToken: any) {
    document.body.dispatchEvent(new CustomEvent("kicked", { detail: { clientId: clientId } }));
  }

  block(clientId: any) {
    this._blockedClients.set(clientId, true);
    document.body.dispatchEvent(new CustomEvent("blocked", { detail: { clientId: clientId } }));
  }

  unblock(clientId: any) {
    this._blockedClients.delete(clientId);
    document.body.dispatchEvent(new CustomEvent("unblocked", { detail: { clientId: clientId } }));
  }

  emitRTCEvent(level: string, tag: string, msgFunc: { (): string; (): string; (): string; (): string; (): any }) {
    if (!window.APP.store.state.preferences.showRtcDebugPanel) return;
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    });
    this.scene.emit("rtc_event", { level, tag, time, msg: msgFunc() });
  }

  async createTrack(constraints: any) {
    this.lastTrack = constraints;
    return this.subAdapter.createTrack(constraints);
  }
}
