// eslint-disable-next-line no-unused-vars
import AgoraRTC, { IAgoraRTCClient, ITrack, ILocalTrack, IAgoraRTCRemoteUser, UID } from "agora-rtc-sdk-ng";
import { getAdapterParams } from "./adapter-config";
// eslint-disable-next-line no-unused-vars
import AdapterUserListener from "./AdapterUserListener";

export class AgoraAdapter {
  currentRoom: IAgoraRTCClient | null = null;
  private adapterUserListener: any;
  private _micProducer: ITrack | null;
  private _videoProducer: any;
  private onTrackRemoved: any;

  constructor(adapterUserListener: AdapterUserListener) {
    this.adapterUserListener = adapterUserListener;
  }

  convertId(clientid: string | number) {
    if (typeof clientid == "number") clientid = clientid.toString();
    return clientid.split("/")[0];
  }

  enableMicrophone(enabled: boolean) {
    if (this.currentRoom && this._micProducer) {
      const track = this._micProducer.getMediaStreamTrack();
      track.enabled = enabled;
    }
  }

  isMicEnabled() {
    if (!this._micProducer) {
      return false;
    }
    return this._micProducer.getMediaStreamTrack().enabled;
  }

  async disableCamera() {
    await this.unpublishVideoTrack();
  }

  async disableShare() {
    await this.unpublishVideoTrack();
  }

  async createTrack(constraints: {
    video: { mediaSource: string; deviceId: { exact: any[] } };
    audio: { deviceId: { exact: any[] } };
  }) {
    /*
        // Create tracks to the local microphone and camera.
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
     */
    let track;
    if (constraints.video) {
      //First check if constraint video because we can have an audio constraint in case of a share screen
      await this.unpublishVideoTrack();
      if (constraints.video.mediaSource === "camera") {
        //https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartc.html#createcameravideotrack
        //https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/customvideotrackinitconfig.html
        track = await AgoraRTC.createCameraVideoTrack({ cameraId: constraints.video.deviceId?.exact[0] });
      } else {
        //https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartc.html#createscreenvideotrack
        //https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/screenvideotrackinitconfig.html
        //track = await AgoraRTC.createScreenVideoTrack(undefined);
        throw Error("Not implemented");
      }
      this._videoProducer = track;
    } else if (constraints.audio) {
      await this.unpublishAudioTrack();
      //https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/microphoneaudiotrackinitconfig.html
      track = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: constraints.audio.deviceId?.exact[0] });
      this._micProducer = track;
    } else {
      return;
    }
    this.currentRoom?.publish(track as ILocalTrack);
    return new MediaStream([track.getMediaStreamTrack()]);
  }

  async connectRoom(clientId: UID | null | undefined, roomId: string) {
    clientId = clientId + "/" + Math.ceil(Math.random() * 10000);

    const roomName = roomId;
    const apiUrl = getAdapterParams().url || window.location.origin + "/service/agora";
    const response1 = await fetch(apiUrl + `/appid`);
    const appID = await response1.text();
    const response2 = await fetch(apiUrl + `/token?identity=${clientId}&roomName=${roomName}`);
    const token = await response2.text();

    const room = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8"
    });
    //https://docs.agora.io/en/faq/API%20Reference/web/interfaces/agorartc.client.html#join
    const uid = await room.join(appID, roomId, token, clientId);
    this.currentRoom = room;
    console.log(uid);
    //room.init(appID,() => console.log("AgoraRTC client initialized") ,(e)=> console.error("AgoraRTC client error",e) );

    const onParticipant = async (participant: IAgoraRTCRemoteUser, mediaType: any) => {
      if (mediaType) {
        const peerId = this.convertId(participant.uid);
        await this.currentRoom?.subscribe(participant, mediaType);
        if (participant.hasAudio && participant.audioTrack) {
          const track = participant.audioTrack as any;
          track.track = track.getMediaStreamTrack();
          this.onTrack(track, peerId, peerId + "-" + mediaType);
        }
        if (participant.hasVideo && participant.videoTrack) {
          const track = participant.videoTrack as any;
          track.track = track.getMediaStreamTrack();
          this.onTrack(track, peerId, peerId + "-" + mediaType);
        }
      }
    };
    this.currentRoom.on("user-joined", (participant: IAgoraRTCRemoteUser, mediaType: any) => {
      //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html
      console.log(`Participant connected: ${participant.uid}`);
      const peerId = this.convertId(participant.uid);
      this.adapterUserListener(peerId);
      onParticipant(participant, mediaType);
    });
    this.currentRoom.on("user-published", (participant, mediaType) => {
      console.log(`Participant connected: ${participant.uid}`);
      onParticipant(participant, mediaType);
    });
    this.currentRoom.on("user-unpublished", (participant, mediaType) => {
      console.log(`Participant unpublished: ${participant.uid}`);
      const peerId = this.convertId(participant.uid);
      this.onTrackRemoved(peerId + "-" + mediaType);
    });
    this.currentRoom.on("user-left", participant => {
      // @ts-ignore
      console.log(`Participant disconnected: ${participant.identity}`);
      const peerId = this.convertId(participant.uid);
      this.adapterUserListener(peerId);
      this.onParticipantDisconnected(peerId);
    });
  }

  setOnTrack(onTrack: { (track: any, peerId: any, trackid: any): void; (track: any, peerId: any, s: string): void }) {
    this.onTrack = onTrack;
  }

  setOnTrackRemoved(onTrackRemoved: (trackId: any) => void) {
    this.onTrackRemoved = onTrackRemoved;
  }

  setOnParticipantDisconnected(onParticipantDisconnected: { (peerId: any): void; (peerId: any): void }) {
    this.onParticipantDisconnected = onParticipantDisconnected;
  }

  disconnect() {
    if (this.currentRoom) {
      this.currentRoom.leave();
    }
  }

  async unpublishAudioTrack() {
    if (this._micProducer) {
      await this.currentRoom?.unpublish(this._micProducer as ILocalTrack);
      this._micProducer = null;
    }
  }

  async unpublishVideoTrack() {
    if (this._videoProducer) {
      await this.currentRoom?.unpublish(this._videoProducer);
      this._videoProducer = null;
    }
  }

  private onTrack(track: any, peerId: any, s: string) {}

  private onParticipantDisconnected(peerId: any) {}
}
