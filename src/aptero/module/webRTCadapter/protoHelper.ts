import protooClient from "protoo-client";
import { getAdapterParams } from "./adapter-config";

export class ProtooHelper {
  private _protoo: protooClient.Peer;
  async init(urlWithParams: URL) {
    let protooTransport;
    const adapterConfig = getAdapterParams();
    if (adapterConfig.transport && adapterConfig.transport === "WebSocketTransport") {
      protooTransport = new protooClient.WebSocketTransport(urlWithParams.toString());
    } else {
      // @ts-ignore
      protooTransport = new protooClient.WebSocketIOTransport(urlWithParams.toString());
    }
    this._protoo = new protooClient.Peer(protooTransport);

    await new Promise(res => {
      this._protoo.on("open", async () => {
        res(true);
      });
    });

    this._protoo.on("disconnected", () => {});

    this._protoo.on("close", () => {});
  }

  async join(_clientId: string, _device: any, _joinToken: any) {
    await this._protoo.request("getRouterRtpCapabilities");
    const res = await this._protoo.request("join", {
      displayName: _clientId,
      device: _device,
      rtpCapabilities: undefined,
      sctpCapabilities: undefined,
      token: _joinToken
    });
    return res;
  }

  async kick(clientId: string, permsToken: string, room: any) {
    return this._protoo.request("kick", {
      room_id: room,
      user_id: clientId,
      token: permsToken
    });
  }

  async block(clientId: string) {
    return this._protoo.request("block", { whom: clientId });
  }

  async unblock(clientId: string) {
    return this._protoo.request("unblock", { whom: clientId });
  }
}
