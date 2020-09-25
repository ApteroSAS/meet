import { networkService } from "./NetworkService";

const EventEmitter = require("eventemitter3");

export class Video360Service {
  eventEmitter = new EventEmitter();
  video = null;
  videoSphere = null;

  constructor() {
  }

  start(){
    // eslint-disable-next-line no-unused-vars
    networkService.onMessageRecv(({ session_id, type, body, from }) => {
      const action_type = type;
      if (action_type === "events:play_video_360") {
        console.log("events:play_video_360");
        this.play(body.time, false);
      }
      if (action_type === "events:pause_video_360") {
        console.log("events:pause_video_360");
        this.pause(body.time, false);
      }
      if (action_type === "events:time_video_360") {
        console.log("events:time_video_360");
        this.setTime(body.time, false);
      }
    });
  }

  play(time = -1, notifyNetwork = true) {
    if (time === -1) {
      time = this.getCurrentTime();
    }
    //this.videoSphere.components.material.play();
    if (this.videoSphere.play) {
      this.videoSphere.play();
    }
    if (this.video.play) {
      this.video.play();
    }
    if (notifyNetwork) {
      networkService.sendMessage("events:play_video_360", { time: time });
    }
    this.setTime(time, notifyNetwork);
  }

  pause(time = -1, notifyNetwork = true) {
    if (time === -1) {
      time = this.getCurrentTime();
    }
    /*this.videoSphere.components.material.pause();*/
    if (this.videoSphere.pause) {
      this.videoSphere.pause();
    }
    if (this.video.pause) {
      this.video.pause();
    }
    if (notifyNetwork) {
      networkService.sendMessage("events:pause_video_360", { time: this.getCurrentTime() });
    }
    this.setTime(time, notifyNetwork);
  }

  getCurrentTime() {
    return this.video.currentTime;
  }

  setTime(time, notifyNetwork = true) {
    if (this.video && this.video.currentTime) {
      this.video.currentTime = time;
    }
    if (notifyNetwork) {
      networkService.sendMessage("events:time_video_360", { time: time });
    }
  }

  enableAndSetVideo(video, aVideoSphere) {
    console.log("set video :", video, aVideoSphere);
    this.video = video;
    this.videoSphere = aVideoSphere;
    this.eventEmitter.emit("change", {});
  }

  disable() {
    if (this.video || this.videoSphere) {
      this.video = null;
      this.videoSphere = null;
      this.eventEmitter.emit("change", {});
    }
  }

  isEnable() {
    return this.video && this.videoSphere;
  }

  action(type) {
    if (type === "play") {
      this.play();
    } else if (type === "pause") {
      this.pause();
    } else if (type === "restart") {
      this.setTime(0);
    }
  }

  onUserJoin() {
    this.setTime(0);
  }

}

export const video360Service = new Video360Service();
