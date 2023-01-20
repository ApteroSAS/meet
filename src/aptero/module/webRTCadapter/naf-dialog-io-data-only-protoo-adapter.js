import protooClient from "protoo-client";
import EventEmitter from "eventemitter3";
import { getAdapterParams } from "./adapter-config";

let debug = console.log;
let error = console.error;
let info = console.log;

export default class DialogIODataOnlyAdapter extends EventEmitter {
  constructor() {
    super();

    this._timeOffsets = [];
    this._occupants = {};
    this._micProducer = null;
    this._cameraProducer = null;
    this._shareProducer = null;
    this._mediaStreams = {};
    this._localMediaStream = null;
    this._consumers = new Map();
    this._frozenUpdates = new Map();
    this._pendingMediaRequests = new Map();
    this._micEnabled = true;
    this._initialAudioConsumerPromise = null;
    this._initialAudioConsumerResolvers = new Map();
    this._serverTimeRequests = 0;
    this._avgTimeOffset = 0;
    this._blockedClients = new Map();
    this.type = "dialog-io-data-only";
    this.occupants = {}; // This is a public field
    this._forceTcp = false;
    this._forceTurn = false;
    this._iceTransportPolicy = "all";
    this._closed = true;
    this.scene = document.querySelector("a-scene");
    this._serverParams = {};
    this._consumerStats = {};
    this._isReconnect = false;
  }

  get consumerStats() {
    return this._consumerStats;
  }

  get downlinkBwe() {
    return this._downlinkBwe;
  }

  get serverUrl() {
    return this._serverUrl;
  }

  setServerUrl(url) {
    this._serverUrl = url;
  }

  setJoinToken(joinToken) {
    this._joinToken = joinToken;
  }

  setTurnConfig(forceTcp, forceTurn) {
  }

  setServerParams(params) {
    this._serverParams = params;
  }

  setApp() {}

  setRoom(roomId) {
    this._roomId = roomId;
  }

  setClientId(clientId) {
    this._clientId = clientId;
  }

  setServerConnectListeners(successListener, failureListener) {
    this._connectSuccess = successListener;
    this._connectFailure = failureListener;
  }

  setRoomOccupantListener(occupantListener) {
    this._onOccupantsChanged = occupantListener;
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
    this._onOccupantConnected = openListener;
    this._onOccupantDisconnected = closedListener;
    this._onOccupantMessage = messageListener;
  }

  /**
   * Gets transport/consumer/producer stats on the server side.
   */
  async getServerStats() {
    if (!this || (this.getConnectStatus() === NAF.adapters.NOT_CONNECTED)) {
      // Signaling channel not connected, no reason to get remote RTC stats.
      return;
    }
    const result = {};
    this.emitRTCEvent("error", "Adapter", () => `Error getting the server status: ${e}`);
    return { error: `Error getting the server status: ${e}` };
  }

  async iceRestart(transport) {
    // Force an ICE restart to gather new candidates and trigger a reconnection
  }

  async recreateSendTransport(iceServers) {
    this.emitRTCEvent("log", "RTC", () => `Recreating send transport ICE`);
  }

  /**
   * Restart ICE in the underlying send peerconnection.
   */
  async restartSendICE() {
    if (this._closed) {
      return;
    }
  }

  /**
   * Checks the Send Transport ICE status and restarts it in case is in failed state.
   * This is called by the Send Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connnection state (ICE connection state)
   */
  checkSendIceStatus(connectionState) {
    // If the ICE connection state is failed, we force an ICE restart
  }

  async recreateRecvTransport(iceServers) {
    this.emitRTCEvent("log", "RTC", () => `Recreating receive transport ICE`);
  }

  /**
   * Restart ICE in the underlying receive peerconnection.
   * @param {boolean} force Forces the execution of the reconnect.
   */
  async restartRecvICE() {
    // Do not restart ICE if Signaling is disconnected. We are not in the meeting room if that's the case.
    if (this._closed) {
      return;
    }
  }

  /**
   * Checks the ReeceiveReeceive Transport ICE status and restarts it in case is in failed state.
   * This is called by the Reeceive Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connection state (ICE connection state)
   */
  checkRecvIceStatus(connectionState) {
    // If the ICE connection state is failed, we force an ICE restart
  }

  async connect() {
    console.warn("protoo connect");
    const urlWithParams = new URL(this._serverUrl);
    urlWithParams.searchParams.append("roomId", this._roomId);
    urlWithParams.searchParams.append("peerId", this._clientId);

    let protooTransport;
    if (getAdapterParams().transport && getAdapterParams().transport === "WebSocketTransport") {
      protooTransport = new protooClient.WebSocketTransport(urlWithParams.toString());
    } else {
      protooTransport = new protooClient.WebSocketIOTransport(urlWithParams.toString());
    }
    this._protoo = new protooClient.Peer(protooTransport);

    this._protoo.on("disconnected", () => {
      console.warn("protoo disconnected");
      this.emitRTCEvent("info", "Signaling", () => `Disconnected`);

      setTimeout(() => {
        this.disconnect();
      }, 2000);
    });

    this._protoo.on("failed", attempt => {
      this.emitRTCEvent("error", "Signaling", () => `Failed: ${attempt}, retrying...`);
      console.warn("protoo failed",attempt);
      if (this._isReconnect) {
        this._reconnectingListener && this._reconnectingListener();
      }
    });

    this._protoo.on("close", () => {
      this.emitRTCEvent("error", "Signaling", () => `Closed`);
      console.warn("protoo close");
      this.disconnect();
      setTimeout(() => {
        this.reconnect(500);
      }, 1000);
    });

    await new Promise((resolve, reject) => {
      this._protoo.on("open", async () => {
        this.emitRTCEvent("info", "Signaling", () => `Open`);
        this._closed = false;

        // We only need to call the reconnect callbacks if it's a reconnection.
        if (this._isReconnect) {
          this._reconnectedListener && this._reconnectedListener();
        } else {
          this._isReconnect = true;
        }

        try {
          await this._joinRoom();
          resolve();
        } catch (err) {
          this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${error}`);
          reject(err);
        }
      });
    });

    this._protoo.on("notification", notification => {
      debug('proto "notification" event [method:%s, data:%o]', notification.method, notification.data);

      switch (notification.method) {
        case "newPeer": {
          console.warn("newPeer")
          const peer = notification.data;
          this.newPeer(peer);

          break;
        }

        case "peerClosed": {
          console.warn("peerClosed")
          const { peerId } = notification.data;
          this.closePeer(peerId);

          break;
        }

        case "peerBlocked": {
          console.warn("peerBlocked")
          const { peerId } = notification.data;
          document.body.dispatchEvent(new CustomEvent("blocked", { detail: { clientId: peerId } }));

          break;
        }

        case "peerUnblocked": {
          console.warn("peerUnblocked")
          const { peerId } = notification.data;
          document.body.dispatchEvent(new CustomEvent("unblocked", { detail: { clientId: peerId } }));

          break;
        }

        case "downlinkBwe": {
          this._downlinkBwe = notification.data;
          break;
        }

        case "consumerLayersChanged": {
          console.warn("consumerLayersChanged")
          const { consumerId, spatialLayer, temporalLayer } = notification.data;

          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            info(`consumerLayersChanged event received without related consumer: ${consumerId}`);
            break;
          }

          this._consumerStats[consumerId] = this._consumerStats[consumerId] || {};
          this._consumerStats[consumerId]["spatialLayer"] = spatialLayer;
          this._consumerStats[consumerId]["temporalLayer"] = temporalLayer;

          // TODO: If spatialLayer/temporalLayer are null, that's probably because the current downlink
          // it's not enough forany spatial layer bitrate. In that case the server has paused the consumer.
          // At this point we it would be nice to give the user some visual cue that this stream is paused.
          // ie. A grey overlay with some icon or replacing the video stream por a generic person image.
          break;
        }

        case "consumerScore": {
          console.warn("consumerScore")
          const { consumerId, score } = notification.data;

          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            info(`consumerScore event received without related consumer: ${consumerId}`);
            break;
          }

          this._consumerStats[consumerId] = this._consumerStats[consumerId] || {};
          this._consumerStats[consumerId]["score"] = score;
        }
      }
    });

    await Promise.all([this.updateTimeOffset(), this._initialAudioConsumerPromise]);
  }

  newPeer(peer) {
    this._onOccupantConnected(peer.id);
    this.occupants[peer.id] = peer;

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }
  }

  closePeer(peerId) {
    this._onOccupantDisconnected(peerId);

    // Resolve initial audio resolver since this person left.
    const initialAudioResolver = this._initialAudioConsumerResolvers.get(peerId);

    if (initialAudioResolver) {
      initialAudioResolver();

      this._initialAudioConsumerResolvers.delete(peerId);
    }

    delete this.occupants[peerId];

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }
  }

  shouldStartConnectionTo() {
    return true;
  }

  startStreamConnection() {}

  closeStreamConnection() {}

  resolvePendingMediaRequestForTrack(clientId, track) {
  }

  removeConsumer(consumerId) {
    this.emitRTCEvent("info", "RTC", () => `Consumer removed: ${consumerId}`);
  }

  getConnectStatus(/*clientId*/) {
    return this._protoo.connected ? NAF.adapters.IS_CONNECTED : NAF.adapters.NOT_CONNECTED;
  }

  getMediaStream(clientId, kind = "audio") {

  }

  getServerTime() {
    return Date.now() + this._avgTimeOffset;
  }

  sendData(clientId, dataType, data) {
    this.unreliableTransport(clientId, dataType, data);
  }
  sendDataGuaranteed(clientId, dataType, data) {
    this.reliableTransport(clientId, dataType, data);
  }
  broadcastData(dataType, data) {
    this.unreliableTransport(undefined, dataType, data);
  }
  broadcastDataGuaranteed(dataType, data) {
    this.reliableTransport(undefined, dataType, data);
  }

  setReconnectionListeners(reconnectingListener, reconnectedListener) {
    this._reconnectingListener = reconnectingListener;
    this._reconnectedListener = reconnectedListener;
  }

  syncOccupants() {
    // Not implemented
  }

  async createSendTransport(iceServers) {

  }

  async closeSendTransport() {
  }

  async createRecvTransport(iceServers) {
  }

  async closeRecvTransport() {
  }

  async createMissingConsumers() {
  }

  async _joinRoom() {
    debug("_joinRoom()");

    await this._protoo.request("join", {
      displayName: this._clientId,
      device: undefined,
      rtpCapabilities: undefined,
      sctpCapabilities: undefined,
      token: this._joinToken
    });

    const audioConsumerPromises = [];
    this.occupants = {};

    this._connectSuccess(this._clientId);
    this._initialAudioConsumerPromise = Promise.all(audioConsumerPromises);

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }
  }

  setLocalMediaStream(stream) {

  }

  createMissingProducers(stream) {

  }

  async enableCamera(track) {

  }

  async disableCamera() {

  }

  async enableShare(track) {

  }

  async disableShare() {

  }

  enableMicrophone(enabled) {

  }

  setWebRtcOptions() {
    // Not implemented
  }

  isDisconnected() {
    return !this._protoo.connected;
  }

  disconnect() {
    if (this._closed) return;
    this._closed = true;

    const occupantIds = Object.keys(this.occupants);
    for (let i = 0; i < occupantIds.length; i++) {
      const peerId = occupantIds[i];
      if (peerId === this._clientId) continue;
      this._onOccupantDisconnected(peerId);
    }

    this.occupants = {};

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }

    debug("disconnect()");

    // Close protoo Peer, though may already be closed if this is happening due to websocket breakdown
    if (this._protoo && this._protoo.connected) {
      this._protoo.close();
      this.emitRTCEvent("info", "Signaling", () => `[close]`);
    }
  }

  reconnect(timeout = 2000) {
    // The Protoo WebSocketTransport server url cannot be updated after it's been created so we need to orce a diconnect/connect
    // to make sure we are using the updated server url for the WSS if it has changed.
    this.disconnect();
    if (this._protoo) {
      this._protoo.removeAllListeners();
      this._protoo.close();
    }
    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  kick(clientId, permsToken) {
    return this._protoo
      .request("kick", {
        room_id: this.room,
        user_id: clientId,
        token: permsToken
      })
      .then(() => {
        document.body.dispatchEvent(new CustomEvent("kicked", { detail: { clientId: clientId } }));
      });
  }

  block(clientId) {
    return this._protoo.request("block", { whom: clientId }).then(() => {
      this._blockedClients.set(clientId, true);
      document.body.dispatchEvent(new CustomEvent("blocked", { detail: { clientId: clientId } }));
    });
  }

  unblock(clientId) {
    return this._protoo.request("unblock", { whom: clientId }).then(() => {
      this._blockedClients.delete(clientId);
      document.body.dispatchEvent(new CustomEvent("unblocked", { detail: { clientId: clientId } }));
    });
  }

  async updateTimeOffset() {
    if (this.isDisconnected()) return;

    const clientSentTime = Date.now();

    const res = await fetch(document.location.href, {
      method: "HEAD",
      cache: "no-cache"
    });

    const precision = 1000;
    const serverReceivedTime = new Date(res.headers.get("Date")).getTime() + precision / 2;
    const clientReceivedTime = Date.now();
    const serverTime = serverReceivedTime + (clientReceivedTime - clientSentTime) / 2;
    const timeOffset = serverTime - clientReceivedTime;

    this._serverTimeRequests++;

    if (this._serverTimeRequests <= 10) {
      this._timeOffsets.push(timeOffset);
    } else {
      this._timeOffsets[this._serverTimeRequests % 10] = timeOffset;
    }

    this._avgTimeOffset = this._timeOffsets.reduce((acc, offset) => (acc += offset), 0) / this._timeOffsets.length;

    if (this._serverTimeRequests > 10) {
      debug(`new server time offset: ${this._avgTimeOffset}ms`);
      setTimeout(() => this.updateTimeOffset(), 5 * 60 * 1000); // Sync clock every 5 minutes.
    } else {
      this.updateTimeOffset();
    }
  }

  toggleFreeze() {
    if (this.frozen) {
      this.unfreeze();
    } else {
      this.freeze();
    }
  }

  freeze() {
    this.frozen = true;
  }

  unfreeze() {
    this.frozen = false;
    this.flushPendingUpdates();
  }

  storeMessage(message) {
    if (message.dataType === "um") {
      // UpdateMulti
      for (let i = 0, l = message.data.d.length; i < l; i++) {
        this.storeSingleMessage(message, i);
      }
    } else {
      this.storeSingleMessage(message);
    }
  }

  storeSingleMessage(message, index) {
    const data = index !== undefined ? message.data.d[index] : message.data;
    const dataType = message.dataType;

    const networkId = data.networkId;

    if (!this._frozenUpdates.has(networkId)) {
      this._frozenUpdates.set(networkId, message);
    } else {
      const storedMessage = this._frozenUpdates.get(networkId);
      const storedData =
        storedMessage.dataType === "um" ? this.dataForUpdateMultiMessage(networkId, storedMessage) : storedMessage.data;

      // Avoid updating components if the entity data received did not come from the current owner.
      const isOutdatedMessage = data.lastOwnerTime < storedData.lastOwnerTime;
      const isContemporaneousMessage = data.lastOwnerTime === storedData.lastOwnerTime;
      if (isOutdatedMessage || (isContemporaneousMessage && storedData.owner > data.owner)) {
        return;
      }

      if (dataType === "r") {
        const createdWhileFrozen = storedData && storedData.isFirstSync;
        if (createdWhileFrozen) {
          // If the entity was created and deleted while frozen, don't bother conveying anything to the consumer.
          this._frozenUpdates.delete(networkId);
        } else {
          // Delete messages override any other messages for this entity
          this._frozenUpdates.set(networkId, message);
        }
      } else {
        // merge in component updates
        if (storedData.components && data.components) {
          Object.assign(storedData.components, data.components);
        }
      }
    }
  }

  onDataChannelMessage(e, source) {
    this.onData(JSON.parse(e.data), source);
  }

  onData(message, source) {
    if (debug.enabled) {
      debug(`DC in: ${message}`);
    }

    if (!message.dataType) return;

    message.source = source;

    if (this.frozen) {
      this.storeMessage(message);
    } else {
      this._onOccupantMessage(null, message.dataType, message.data, message.source);
    }
  }

  getPendingData(networkId, message) {
    if (!message) return null;

    const data = message.dataType === "um" ? this.dataForUpdateMultiMessage(networkId, message) : message.data;

    // Ignore messages from users that we may have blocked while frozen.
    if (data.owner && this._blockedClients.has(data.owner)) return null;

    return data;
  }

  // Used externally
  getPendingDataForNetworkId(networkId) {
    return this.getPendingData(networkId, this._frozenUpdates.get(networkId));
  }

  flushPendingUpdates() {
    for (const [networkId, message] of this._frozenUpdates) {
      const data = this.getPendingData(networkId, message);
      if (!data) continue;

      // Override the data type on "um" messages types, since we extract entity updates from "um" messages into
      // individual frozenUpdates in storeSingleMessage.
      const dataType = message.dataType === "um" ? "u" : message.dataType;

      this._onOccupantMessage(null, dataType, data, message.source);
    }
    this._frozenUpdates.clear();
  }

  dataForUpdateMultiMessage(networkId, message) {
    // "d" is an array of entity datas, where each item in the array represents a unique entity and contains
    // metadata for the entity, and an array of components that have been updated on the entity.
    // This method finds the data corresponding to the given networkId.
    for (let i = 0, l = message.data.d.length; i < l; i++) {
      const data = message.data.d[i];

      if (data.networkId === networkId) {
        return data;
      }
    }

    return null;
  }

  emitRTCEvent(level, tag, msgFunc) {
    if (!window.APP.store.state.preferences.showRtcDebugPanel) return;
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    });
    this.scene.emit("rtc_event", { level, tag, time, msg: msgFunc() });
  }
}

NAF.adapters.register("dialog-io-data-only", DialogIODataOnlyAdapter);
