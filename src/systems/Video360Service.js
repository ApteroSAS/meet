const EventEmitter = require("eventemitter3");

export class Video360Service {
  eventEmitter = new EventEmitter();
  video=null;
  videoSphere=null;

  play(time=-1, notifyNetwork = true) {
    if(time===-1){
      time = this.getCurrentTime();
    }
    //this.videoSphere.components.material.play();
    if(this.videoSphere.play) {
      this.videoSphere.play();
    }
    if(this.video.play) {
      this.video.play();
    }
    if (notifyNetwork) {
      //this.hubPhxChannel.push("events:play_video_360", {});
      this.hubPhxChannel.push("message", { type: "events:play_video_360", body: {time:time }});
      console.log("play");
    }
    this.setTime(time,notifyNetwork);
  }

  pause(time=-1, notifyNetwork = true) {
    if(time===-1){
      time = this.getCurrentTime();
    }
    /*this.videoSphere.components.material.pause();*/
    if(this.videoSphere.pause) {
      this.videoSphere.pause();
    }
    if(this.video.pause) {
      this.video.pause();
    }
    if (notifyNetwork) {
      //this.hubPhxChannel.push("events:pause_video_360", {});
      this.hubPhxChannel.push("message", { type: "events:pause_video_360", body: {time:this.getCurrentTime()}});
      console.log("pause");
    }
    this.setTime(time,notifyNetwork);
  }

  getCurrentTime(){
    return this.video.currentTime;
  }

  setTime(time, notifyNetwork = true) {
    if(this.video && this.video.currentTime) {
      this.video.currentTime = time;
    }
    if (notifyNetwork) {
      //this.hubPhxChannel.push("events:time_video_360", { time: time });
      this.hubPhxChannel.push("message", { type: "events:time_video_360", body: { time: time } });
      console.log("setTime");
    }
  }

  enableAndSetVideo(video, aVideoSphere) {
    console.log("set video :",video,aVideoSphere)
    this.video = video;
    this.videoSphere = aVideoSphere;
    this.eventEmitter.emit("change", {});
  }

  disable() {
    if(this.video || this.videoSphere) {
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

  onUserJoin(){
    this.setTime(0);
  }

  processMessage({ session_id, type, body, from }) {
    const action_type = type;
    if (action_type === "events:play_video_360") {
      console.log("events:play_video_360");
      this.play(body.time,false);
    }
    if (action_type === "events:pause_video_360") {
      console.log("events:pause_video_360");
      this.pause(body.time,false);
    }
    if (action_type === "events:time_video_360") {
      console.log("events:time_video_360");
      this.setTime(body.time, false);
    }
  }

  setPhoenixChannel(hubPhxChannel) {
    this.hubPhxChannel = hubPhxChannel;
    //TODO reactivate when implemented in server
    /*this.hubPhxChannel.on("events:play_video_360", ({ session_id, type, body, from }) => {
      console.log("events:play_video_360");
      this.play(false);
    });
    this.hubPhxChannel.on("events:pause_video_360", ({ session_id, type, body, from }) => {
      console.log("events:pause_video_360");
      this.pause(false);

    });
    this.hubPhxChannel.on("events:time_video_360", ({ session_id, type, body, from }) => {
      console.log("events:time_video_360");
      console.log(body);
      this.setTime(body.time,false);
    });*/
  }
}

export const video360Service = new Video360Service();

