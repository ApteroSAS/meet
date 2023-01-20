import * as Video from "twilio-video";
import { propertiesService } from "../properties/propertiesService";
import { getAdapterParams } from "./adapter-config";

export class TwilioAdapter {
  currentRoom: Video.Room | null = null;
  videoTrack = null;
  twilioMicEnable = false;
  onTrack: (a: any, b: any, c: any) => void = () => {
    console.error("invalid");
  };
  private adapterUserListener: any;
  private onParticipantDisconnected: any;

  constructor(adapterUserListener: any) {
    this.adapterUserListener = adapterUserListener;
  }

  convertId(twilioCLientId: string) {
    return twilioCLientId.split("/")[0];
  }

  async unpublishGivenVideoTrack(track: any) {
    if (track) {
      const video = track._dummyEl;
      try {
        track.stop();
        track.detach();
        this.currentRoom?.localParticipant.unpublishTrack(track);
      } catch (e) {
        /* happens in case of remote track*/
      }
      if (video) {
        video.pause();
        video.removeAttribute("src"); // empty source
        video.srcObject = null;
        video.load();
      }
      track._dummyEl = null;
      track = null;
    }
  }

  async unpublishVideoTrack() {
    if (this.currentRoom) {
      for (const publication of this.currentRoom.localParticipant.videoTracks) {
        const publicationobj = publication[1];
        //if(publication.track === videoTrack){
        await this.unpublishGivenVideoTrack(publicationobj.track);
        publicationobj.unpublish();
        //console.log('unpublish')
        //}
      }
    }
    this.videoTrack = null;
  }

  enableMicrophone(enabled: boolean) {
    //console.log("mic :",enabled)
    if (this.currentRoom) {
      if (enabled) {
        this.currentRoom.localParticipant.audioTracks.forEach(publication => {
          publication.track.enable();
        });
      } else {
        this.currentRoom.localParticipant.audioTracks.forEach(publication => {
          publication.track.disable();
        });
      }
    }
    this.twilioMicEnable = enabled;
  }

  isMicEnabled() {
    return this.twilioMicEnable;
  }

  async disableCamera() {
    await this.unpublishVideoTrack();
  }

  async disableShare() {
    await this.unpublishVideoTrack();
  }

  async createTrack(constraints: any) {
    //console.log("createTwilioTrack");
    const room = this.currentRoom;
    if (constraints.video) {
      //First check if constraint video because we can have an audio constraint in case of a share screen
      await this.unpublishVideoTrack();
      if (constraints.video.mediaSource === "camera") {
        //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
        const localTracks: any = await Video.createLocalTracks(constraints);
        //console.log("currentTracks updated: " + localTracks);
        if (room) {
          await room.localParticipant?.publishTrack(localTracks[0]);
        }
        this.videoTrack = localTracks[0];
        return new MediaStream([localTracks[0].mediaStreamTrack]);
      } else {
        //https://www.twilio.com/docs/video/javascript-v1-screen-capture-chrome
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        const localTracks: any = await new Video.LocalVideoTrack(stream.getTracks()[0]);
        //console.log("currentTracks updated: " + localTracks);
        if (room) {
          await room.localParticipant?.publishTrack(localTracks);
        }
        this.videoTrack = localTracks;
        return new MediaStream([localTracks.mediaStreamTrack]);
      }
    } else if (constraints.audio) {
      await this.unpublishAudioTrack();
      //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
      const localTracks: any = await Video.createLocalTracks(constraints);
      //console.log("currentTracks updated: " + localTracks);
      if (room) {
        await room.localParticipant?.publishTrack(localTracks[0]);
      }
      this.enableMicrophone(this.twilioMicEnable);
      return new MediaStream([localTracks[0].mediaStreamTrack]);
    }
  }

  async connectRoom(clientId: string, roomId: any) {
    this.disconnect(); //disconnect before connecting
    clientId = clientId + "/" + Math.ceil(Math.random() * 10000);
    //console.log("Twilio Connect Room");
    const { connect } = require("twilio-video");
    // Join to the Room with the given AccessToken and ConnectOptions.
    const roomName = roomId;
    let apiUrl;
    if (!getAdapterParams().url) {
      const url =
        propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/adapter/twilio/profile";
      const resp = await fetch(url);
      const adapterParams = await resp.json();
      apiUrl = adapterParams.url;
    } else {
      apiUrl = getAdapterParams().url;
    }
    const response = await fetch(apiUrl + `?identity=${clientId}&roomName=${roomName}`);
    // Extract the AccessToken from the Response.
    const token = await response.text();
    this.currentRoom = await connect(token, { audio: false, video: false });

    const onTwilioParticipant = (participant: Video.RemoteParticipant) => {
      //console.log(`Participant connected: ${participant.identity}`);
      const peerId = this.convertId(participant.identity);
      this.adapterUserListener.notifyUserEnter(peerId);
      participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
          const track: any = publication.track;
          track.track = track.mediaStreamTrack;
          this.onTrack(track, peerId, track.name);
        }
        publication.on("subscribed", track => {
          //console.log(`publication subscribed`, track);
        });
        publication.on("unsubscribed", track => {
          //console.log(`publication unsubscribed`, track);
        });
      });

      participant.on("trackSubscribed", (track: any) => {
        const peerId = this.convertId(participant.identity);
        track.track = track.mediaStreamTrack;
        this.onTrack(track, peerId, track.name);
      });
      participant.on("trackUnsubscribed", track => {
        this.unpublishGivenVideoTrack(track);
        this.onTrackRemoved(track.name);
        //console.log(`Participant trackUnsubscribed`, track);
      });
      participant.on("trackPublished", track => {
        //console.log(`Participant trackPublished`, track);
      });
      participant.on("trackUnpublished", track => {
        //console.log(`Participant trackUnpublished`, track);
      });
    };
    if (!this.currentRoom) return;
    this.currentRoom.participants.forEach(participant => {
      onTwilioParticipant(participant);
    });
    this.currentRoom.on("participantConnected", onTwilioParticipant);

    this.currentRoom.on("participantDisconnected", participant => {
      //console.log(`Participant disconnected: ${participant.identity}`);
      const peerId = this.convertId(participant.identity);
      this.adapterUserListener.notifyUserLeave(peerId);
      this.onParticipantDisconnected(peerId);
    });
  }

  setOnTrack(onTrack: any) {
    this.onTrack = onTrack;
  }

  setOnTrackRemoved(onTrackRemoved: any) {
    this.onTrackRemoved = onTrackRemoved;
  }

  setOnParticipantDisconnected(onParticipantDisconnected: any) {
    this.onParticipantDisconnected = onParticipantDisconnected;
  }

  disconnect() {
    if (this.currentRoom) {
      this.currentRoom.disconnect();
    }
  }

  async unpublishAudioTrack() {
    if (this.currentRoom) {
      for (const publication of this.currentRoom.localParticipant.tracks) {
        const publicationObj = publication[1];
        if (publicationObj.track.kind === "audio") {
          publicationObj.track.stop();
          publicationObj.unpublish();
          //console.log('unpublish audio')
        }
      }
    }

    this.videoTrack = null;
  }

  private onTrackRemoved(name: any) {}
}
