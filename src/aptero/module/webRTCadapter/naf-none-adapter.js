import EventEmitter from "eventemitter3";
import AdapterUserListener from "./AdapterUserListener";

export default class NoneAdapter extends EventEmitter {
  occupants = {};

  constructor() {
    super();
    this.adapterUserListener = new AdapterUserListener();
  }

  async connect({
                  serverUrl,
                  roomId,
                  joinToken,
                  serverParams,
                  scene,
                  clientId,
                  forceTcp,
                  forceTurn,
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
  }

  toggleMicrophone() {

  }

  enableMicrophone(enabled) {

  }

  async getMediaStream(clientId, kind) {
    return null;
  }

  setLocalMediaStream(stream) {

  }

  disconnect() {
    this.adapterUserListener.disconnect();
  }
}
