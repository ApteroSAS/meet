import { PropertiesFormat, PROPERTY_KEY } from "../PropertiesFormat";
import { getServiceSync } from "@aptero/axolotis-player";
import { PROPERTIES_SERVICE } from "../../const";
import { Properties } from "@aptero/axolotis-module-basic";

export function getMsProperties() {
  return getServiceSync<Properties>(PROPERTIES_SERVICE).get<PropertiesFormat>(PROPERTY_KEY);
}
