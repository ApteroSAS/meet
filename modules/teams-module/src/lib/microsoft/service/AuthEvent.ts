import { EventEmitter } from "eventemitter3";

export const LOGGED_BASIC_INFO = "ms-auth-basic-info";
export const TOKEN_RECEIVED = "ms-auth-basic-info";
export const AUTH_SERVICE_INITIALIZE = "ms-auth-service-initialized";
let events = new EventEmitter();

events.on(AUTH_SERVICE_INITIALIZE, () => {
  console.log("AUTH_SERVICE_INITIALIZE");
});

export function getAuthEvents() {
  return events;
}
