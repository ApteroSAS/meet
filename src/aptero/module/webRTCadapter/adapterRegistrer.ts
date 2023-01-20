//adapterRegister
// beware of import compatibility eg scene.html does not have NAF available
/*import "./naf-twilio-adapter";
import "./naf-dialog-io-adapter";
import "./naf-agora-adapter";*/

export async function lazyLoad(adapter: string) {
  if (adapter === "twilio") {
    return await import("./naf-twilio-adapter");
  }
  if (adapter === "dialog-io") {
    return await import("./naf-dialog-io-adapter");
  }
  if (adapter === "dialog-io-data-only") {
    return await import("./naf-dialog-io-data-only-adapter");
  }
  if (adapter === "agora") {
    return await import("./naf-agora-adapter");
  }
  if (adapter === "none") {
    return await import("./naf-none-adapter");
  }
  if (adapter === "socketio") {
    return await import("./naf-socketio-adapter");
  }
}
