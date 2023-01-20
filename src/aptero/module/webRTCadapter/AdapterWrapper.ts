import EventEmitter from "eventemitter3";
import { adapterFactory } from "./adapter-config";
import { wait } from "../../util/AsyncWaiter";
import { roomParameters } from "../HubsBridge/service/RoomParameters";

declare const AFRAME: any;

export class AdapterWrapper {
  lasyLoadingFinished = false;
  tmplisteners: any = {};
  private tmpEventEmiter: EventEmitter<string | symbol, any>;
  private on: (event: any, fn: any) => void;
  private __proto__: any;

  constructor() {
    this.tmpEventEmiter = new EventEmitter();
    this.on = (event, fn) => {
      if (!this.tmplisteners[event]) {
        this.tmplisteners[event] = [];
      }
      this.tmplisteners[event].push({ fn });
    };
    this.internalInit();
  }

  async internalInit() {
    //wait for application ready
    await wait(() => {
      return AFRAME && AFRAME.scenes && AFRAME.scenes[0];
    });
    //wait for room parameters retreived
    await roomParameters.applyRoomParameters();
    const adapter = await adapterFactory();

    //events emitter
    // @ts-ignore
    delete this["on"];
    Object.keys(this.tmplisteners).forEach(event => {
      const listeners = this.tmplisteners[event];
      if (listeners && adapter) {
        listeners.forEach((entry: any) => {
          adapter.on(event, entry.fn);
        });
      }
    });

    //variables
    Object.keys(adapter as object).forEach(key => {
      // @ts-ignore
      this[key] = adapter[key];
    });

    //function
    // @ts-ignore
    this.__proto__ = adapter.__proto__;

    this.lasyLoadingFinished = true;
  }
}
