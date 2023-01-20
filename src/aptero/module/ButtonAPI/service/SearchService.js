import { EventTarget } from "event-target-shim";

export class SearchService extends EventTarget {
  resultAwaited = false;//used externaly as information
  lastAction = () => {
  };

  async cancelSearchWithResult(wait = 0) {
    this.lastAction({ detail: { result: "cancel" } });
    //wait propagation of event
    await new Promise((resolve) => {
      setTimeout(resolve, wait);
    });
  }

  async sourceNavigateWithResult(source) {
    return new Promise(async (resolve, reject) => {
      this.lastAction({ detail: { result: "cancel" } });
      this.resultAwaited = true;
      const sceneEl = AFRAME.scenes[0];
      sceneEl.removeEventListener("action_selected_media_result_entry", this.lastAction);
      if (source.endsWith("-simple")) {
        sceneEl.emit("apt-show-simple-media-select", { source });
      } else {
        await window.APP.mediaSearchStore._sourceNavigate(source, true, false, "result");
      }
      this.lastAction = (data) => {
        data = data.detail;
        if (data.result === "cancel") {
          this.resultAwaited = false;
          reject("cancel");
        } else {
          this.resultAwaited = false;
          resolve(data.entry);
        }
      };
      sceneEl.addEventListener("action_selected_media_result_entry", this.lastAction, { once: true });
    });
  }
}

export const searchService = new SearchService();
