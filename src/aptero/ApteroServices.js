import { liveStream } from "./service/LiveStream";
import { changeVideoService } from "./service/ChangeVideoService";
import { microsoftService } from "./service/MicrosoftService";
import { networkService } from "./service/NetworkService";
import { roomInteractableRemover } from "./service/RoomInteractableRemover";
import { video360Service } from "./service/Video360Service";
import { waitForDOMContentLoaded } from "../utils/async-utils";

import "./component/custom-controller-button";
import "./component/media-limiter";
import { gltfExtensionProcessorService } from "./service/GLTFExtensionProcessorService";
import { staticObjectManipulator } from "./service/StaticObjectManipulator";

export class ApteroServices{
  constructor(){
  }

  async start(){
    waitForDOMContentLoaded().then(async () => {
      await networkService.start();
      await changeVideoService.start();
      await liveStream.start();
      await microsoftService.start();
      //await roomInteractableRemover.start();
      await staticObjectManipulator.start();
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