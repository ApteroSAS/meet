import EventEmitter from "eventemitter3";

let debug = console.log;
let error = console.error;

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

    try {
      await this._joinRoom();
    } catch (err) {
      this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${error}`);
    }

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
    return NAF.adapters.IS_CONNECTED;
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
    return false;
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
  }

  reconnect(timeout = 2000) {
    // The Protoo WebSocketTransport server url cannot be updated after it's been created so we need to orce a diconnect/connect
    // to make sure we are using the updated server url for the WSS if it has changed.
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  kick(clientId, permsToken) {
  }

  block(clientId) {
  }

  unblock(clientId) {
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
