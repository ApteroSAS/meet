import { IService } from "@aptero/axolotis-player";
import { generateHubName } from "./name-generation";

export class NameGenerationService implements IService {
  getType(): string {
    return NameGenerationService.name;
  }

  generateHubName() {
    return generateHubName();
  }
}
