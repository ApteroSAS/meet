import { liveStreamService } from "./liveStreamService";
import { changeVideoService } from "./ChangeVideoService";
import { microsoftService } from "./MicrosoftService";
import { networkService } from "./NetworkService";
import { roomInteractableRemover } from "./RoomInteractableRemover";
import { video360Service } from "./Video360Service";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import "../custom-controller-button";
import { gltfExtensionProcessorService } from "./GLTFExtensionProcessorService";

export class ApteroServices{
  constructor(){
  }

  async start(){
    waitForDOMContentLoaded().then(async () => {
      await networkService.start();
      await changeVideoService.start();
      await liveStreamService.start();
      await microsoftService.start();
      await roomInteractableRemover.start();
      await video360Service.start();
      await gltfExtensionProcessorService.start();
    });
  }

  tick(){

  }

  remove(){

  }
}

export const apteroService = new ApteroServices();