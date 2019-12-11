import { VOLUME_LABELS } from "./media-views";
import {eventEmitter} from "./audio-feedback"
AFRAME.registerComponent("avatar-volume-controls", {
  schema: {
    volume: { type: "number", default: 1.0 }
  },

  init() {
    this.volumeUp = this.volumeUp.bind(this);
    this.volumeDown = this.volumeDown.bind(this);
    this.changeVolumeBy = this.changeVolumeBy.bind(this);
    this.volumeUpButton = this.el.querySelector(".avatar-volume-up-button");
    this.volumeDownButton = this.el.querySelector(".avatar-volume-down-button");
    this.volumeLabel = this.el.querySelector(".avatar-volume-label");
    this.volumeUpButton.object3D.addEventListener("interact", this.volumeUp);
    this.volumeDownButton.object3D.addEventListener("interact", this.volumeDown);

    this.updateVolumeLabel();
    eventEmitter.on("speak:local:start",()=>{
      this.beforeVolumeDecrease = this.data.volume;
      this.changeVolume(0.3);
      console.log("volume changed to "+this.data.volume);
    });
    eventEmitter.on("speak:local:stop",()=>{
      this.changeVolume(this.beforeVolumeDecrease);
      console.log("volume changed to "+this.data.volume);
    });
  },

  changeVolume(v) {
    this.el.setAttribute("avatar-volume-controls", "volume", THREE.Math.clamp(v, 0, 1));
    this.updateVolumeLabel();
  },

  changeVolumeBy(v) {
    this.el.setAttribute("avatar-volume-controls", "volume", THREE.Math.clamp(this.data.volume + v, 0, 1));
    this.updateVolumeLabel();
  },

  volumeUp() {
    this.changeVolumeBy(0.1);
  },

  volumeDown() {
    this.changeVolumeBy(-0.1);
  },

  update() {
    if (this.audio && this.audio.gain && this.audio.gain.gain && this.audio.gain.gain.value) {
      this.audio.gain.gain.value = this.data.volume;
    }
  },

  updateVolumeLabel() {
    this.volumeLabel.setAttribute(
      "text",
      "value",
      this.data.volume === 0 ? "Muted" : VOLUME_LABELS[Math.floor(this.data.volume / 0.05)]
    );
  },

  tick() {
    if (this.audio) return;

    // Walk up to Spine and then search down.
    const source = this.el.parentNode.parentNode.querySelector("[networked-audio-source]");
    if (!source) return;

    this.audio = source.components["networked-audio-source"].sound;
    this.update();
  }
});
