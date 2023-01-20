import EventEmitter from "eventemitter3";

declare const window: any;

export default class AdapterUserListener {
  em = new EventEmitter();
  onUserEnter(callback: (...args: any[]) => void) {
    this.em.on("enter", callback);
    return () => {
      this.em.off("enter", callback);
    };
  }

  onUserLeave(callback: (...args: any[]) => void) {
    this.em.on("leave", callback);
    return () => {
      this.em.off("leave", callback);
    };
  }

  notifyUserEnter(peerid: any) {
    window.APP.scene.emit("join");
    this.em.emit("enter", peerid);
  }

  notifyUserLeave(peerid: any) {
    this.em.emit("leave", peerid);
  }

  disconnect() {
    this.em.removeAllListeners();
  }
}
