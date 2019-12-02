import { SOUND_SPAWN_PEN } from "../systems/sound-effects-system";
import { video360Service } from "../systems/Video360Service";
/**
 * HUD panel for muting, freezing, and other controls that don't necessarily have hardware buttons.
 * @namespace ui
 * @component in-world-hud
 */
AFRAME.registerComponent("in-world-hud", {
  init() {

    video360Service.eventEmitter.on("change",()=>{
      this.updateButtonStates();
    });

    this.mic = this.el.querySelector(".mic");
    this.spawn = this.el.querySelector(".spawn");
    this.pen = this.el.querySelector(".penhud");
    this.inviteBtn = this.el.querySelector(".invite-btn");
    this.background = this.el.querySelector(".bg");

    this.quitbtn = this.el.querySelector(".quitbtn");
    this.playbtn = this.el.querySelector(".play");
    this.pausebtn = this.el.querySelector(".pause");
    this.restartbtn = this.el.querySelector(".restart");

    this.updateButtonStates = () => {
      this.mic.setAttribute("mic-button", "active", this.el.sceneEl.is("muted"));
      this.pen.setAttribute("icon-button", "active", this.el.sceneEl.is("pen"));
      if (window.APP.hubChannel) {
        this.spawn.setAttribute("icon-button", "disabled", !window.APP.hubChannel.can("spawn_and_move_media"));
        this.pen.setAttribute("icon-button", "disabled", !window.APP.hubChannel.can("spawn_drawing"));
      }

      const active = video360Service.isEnable();
      this.playbtn.setAttribute("icon-button", "disabled", !active);
      this.pausebtn.setAttribute("icon-button", "disabled", !active);
      this.restartbtn.setAttribute("icon-button", "disabled", !active);
    };

    this.onStateChange = evt => {
      if (!(evt.detail === "muted" || evt.detail === "frozen" || evt.detail === "pen" || evt.detail === "camera"))
        return;
      this.updateButtonStates();
    };

    this.onMicClick = () => {
      this.el.emit("action_mute");
    };

    this.onSpawnClick = () => {
      if (!window.APP.hubChannel.can("spawn_and_move_media")) return;
      this.el.emit("action_spawn");
    };

    this.onPenClick = e => {
      if (!window.APP.hubChannel.can("spawn_drawing")) return;
      this.el.emit("spawn_pen", { object3D: e.object3D });
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SPAWN_PEN);
    };

    this.onCameraClick = () => {
      if (!window.APP.hubChannel.can("spawn_camera")) return;
      this.el.emit("action_toggle_camera");
    };

    this.onInviteClick = () => {
      this.el.emit("action_invite");
    };

    this.onQuitClick = () => {
      window.location = window.location.origin;
    };

    this.onPlayClick = () => {
      video360Service.play();
    };

    this.onPauseClick = () => {
      video360Service.pause();
    };

    this.onRestartClick = () => {
      video360Service.setTime(0);
    };

  },

  play() {
    this.el.sceneEl.addEventListener("stateadded", this.onStateChange);
    this.el.sceneEl.addEventListener("stateremoved", this.onStateChange);
    this.el.sceneEl.systems.permissions.onPermissionsUpdated(this.updateButtonStates);
    this.updateButtonStates();

    this.playbtn.object3D.addEventListener("interact", this.onPlayClick);
    this.pausebtn.object3D.addEventListener("interact", this.onPauseClick);
    this.restartbtn.object3D.addEventListener("interact", this.onRestartClick);
    this.quitbtn.object3D.addEventListener("interact", this.onQuitClick);

    this.mic.object3D.addEventListener("interact", this.onMicClick);
    this.spawn.object3D.addEventListener("interact", this.onSpawnClick);
    this.pen.object3D.addEventListener("interact", this.onPenClick);
    this.inviteBtn.object3D.addEventListener("interact", this.onInviteClick);
  },

  pause() {
    this.el.sceneEl.removeEventListener("stateadded", this.onStateChange);
    this.el.sceneEl.removeEventListener("stateremoved", this.onStateChange);
    window.APP.hubChannel.removeEventListener("permissions_updated", this.updateButtonStates);


    this.playbtn.object3D.addEventListener("interact", this.onPlayClick);
    this.pausebtn.object3D.addEventListener("interact", this.onPauseClick);
    this.restartbtn.object3D.addEventListener("interact", this.onRestartClick);
    this.quitbtn.object3D.removeEventListener("interact", this.onQuitClick);

    this.mic.object3D.removeEventListener("interact", this.onMicClick);
    this.spawn.object3D.removeEventListener("interact", this.onSpawnClick);
    this.pen.object3D.removeEventListener("interact", this.onPenClick);
    this.inviteBtn.object3D.removeEventListener("interact", this.onInviteClick);
  }
});
