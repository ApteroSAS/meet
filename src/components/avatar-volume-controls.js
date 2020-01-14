import { VOLUME_LABELS } from "./media-views";
import { eventEmitter} from "./audio-feedback";

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
    this.beforeVolumeDecrease = this.data.volume;

    //Echo is when I speak and I heard my voice in the speaker (meaning that the sound of my voice got to the the speaker of the other participant and back through its mic)
    //So we reduce the sound of the speaker when we speak so we heard less echo and also prevend echo feedback loop
    // speak:network:start triggering while we speak just means that we are receiving echo (or the person is speaking at the same time as us

    eventEmitter.on("speak:local:start", () => {
      //we try to prevent echo by diminishing the sound when we speak
      this.beforeVolumeDecrease = this.data.volume;
      this.changeVolume(0.4);
      console.log("volume changed to " + this.data.volume);
    });

    eventEmitter.on("speak:local:stop", () => {
      //we try to prevent echo by diminishing the sound when we speak
      this.changeVolume(this.beforeVolumeDecrease);
      console.log("volume changed to " + this.data.volume);
    });
  },

  changeVolume(v) {
    if (this && this.el && this.data && this.data.volume && v) {
      this.el.setAttribute("avatar-volume-controls", "volume", THREE.Math.clamp(v, 0, 1));
      this.updateVolumeLabel();
    }
  },

  changeVolumeBy(v) {
    if (this && this.el && this.data && this.data.volume && v) {
      this.el.setAttribute("avatar-volume-controls", "volume", THREE.Math.clamp(this.data.volume + v, 0, 1));
      this.updateVolumeLabel();
    }
  },

  volumeUp() {
    this.changeVolumeBy(0.1);
  },

  volumeDown() {
    this.changeVolumeBy(-0.1);
  },

  update() {
    if (this && this.audio && this.audio.gain && this.audio.gain.gain && this.audio.gain.gain.value && this.data && this.data.volume) {
      this.audio.gain.gain.value = THREE.Math.clamp(this.data.volume, 0, 1);
    }
  },

  updateVolumeLabel() {
    if (this && this.volumeLabel && this.data && this.data.volume) {
      this.volumeLabel.setAttribute(
        "text",
        "value",
        this.data.volume === 0 ? "Muted" : VOLUME_LABELS[Math.floor(this.data.volume / 0.05)]
      );
    }
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
