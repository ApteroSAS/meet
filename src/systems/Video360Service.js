const EventEmitter = require('eventemitter3');

export class Video360Service {
  eventEmitter = new EventEmitter();
  video;
  videoSphere;

  play(){
    /*this.videoSphere.components.material.play();
    this.videoSphere.play();*/
    this.video.play();
    console.log("play")
  }

  pause(){
    /*this.videoSphere.components.material.pause();
    this.videoSphere.pause();*/
    this.video.pause();
    console.log("pause")
  }

  setTime(time){
    this.video.currentTime = time;
    console.log("setTime")
  }

  enableAndSetVideo(video,aVideoSphere){
    this.video = video;
    this.videoSphere = aVideoSphere;
    this.eventEmitter.emit("change",{});
  }

  disable(){
    this.video = null;
    this.videoSphere = null;
    this.eventEmitter.emit("change",{});
  }

  isEnable(){
    return this.video && this.videoSphere;
  }

  action(type){
    if(type==="play"){
      this.play();
    }else if(type==="pause"){
      this.pause();
    }else if(type==="restart"){
      this.setTime(0);
    }
  }

}

export const video360Service = new Video360Service();

