const EventEmitter = require("eventemitter3");

export class NetworkService {
  eventEmitter = new EventEmitter();

  sendMessage(type,data){
    this.hubPhxChannel.push("message", { type: type, body:data });
  }

  /**
   *
   * @param callback { session_id, type, body, from }
   * @returns {Function}
   */
  onMessage(callback){
    this.eventEmitter.on("msg_recv",callback);
    return ()=>{
      this.eventEmitter.off("msg_recv",callback);
    }
  }

  processMessage({ session_id, type, body, from }) {
    this.eventEmitter.emit("msg_recv",{ session_id, type, body, from })
  }

  setPhoenixChannel(hubPhxChannel) {
    this.hubPhxChannel = hubPhxChannel;
  }
}

export const networkService = new NetworkService();

