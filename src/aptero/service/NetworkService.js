const EventEmitter = require("eventemitter3");

export class NetworkService {
  eventEmitter = new EventEmitter();

  constructor(){}

  start(){
    /* empty start to ensure the import is made*/
  }

  sendMessage(type,data){
    this.hubPhxChannel.push("message", { type: type, body:data });
  }

  /**
   *
   * @param callback { session_id, type, body, from }
   * @returns {Function}
   */
  onMessageRecv(callback){
    this.eventEmitter.on("msg_recv",callback);
    return ()=>{
      this.eventEmitter.off("msg_recv",callback);
    }
  }

  onMessage(type,callback){
    this.eventEmitter.on(type,callback);
    return ()=>{
      this.eventEmitter.off(type,callback);
    }
  }

  processMessage({ session_id, type, body, from }) {
    this.eventEmitter.emit("msg_recv",{ session_id, type, body, from })
    this.eventEmitter.emit(type,body);
  }

  setPhoenixChannel(hubPhxChannel) {
    this.hubPhxChannel = hubPhxChannel;
  }

  notifyAdapterReady(){
    this.eventEmitter.emit("adapter_ready");
  }
}

export const networkService = new NetworkService();