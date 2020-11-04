
import axios from "axios";
import { propertiesService } from "../properties/propertiesService";

export class RoomParameters {
  async getParameters(roomSID){
    return await new Promise((resolve, reject) => {
      axios.get(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/room/"+roomSID).then(resp => {
        resolve(resp.data);
      }).catch(reason => {
        reject(reason);
      });
    })
  }
  async applyConfig(roomSID){
    let roomConfig = await this.getParameters(roomSID);
    window.APP.override = {preferences:{}};
    if(roomConfig.preferences){
      Object.keys(roomConfig.preferences).forEach(key => {
        window.APP.store.state.preferences[key] = roomConfig.preferences[key];
      })
    }
    if(roomConfig.preferencesOverride){
      Object.keys(roomConfig.preferencesOverride).forEach(key => {
        window.APP.override.preferences[key] = roomConfig.preferencesOverride[key];
      })
    }
    if(roomConfig.entryMode){
      if(location.href.indexOf("vr_entry_type")===-1) {
        let mode = (location.href.indexOf("?")===-1?"?":"&")+"vr_entry_type=" + roomConfig.entryMode;
        location.href = location.href + mode;
      }
    }
  }
}

export const roomParameters = new RoomParameters();