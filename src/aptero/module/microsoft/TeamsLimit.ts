import { msTeamsAPILight } from "@aptero/axolotis-module-teams";
import { propertiesService } from "../properties/propertiesService";
const configs = propertiesService;

export function isTeamsLimitedOK() {
  return !msTeamsAPILight().msTeams() || !configs.feature("teams_limited");
}
