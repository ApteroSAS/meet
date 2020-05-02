import axios from "axios";
import { propertiesService } from "../../propertiesService";
import Store from "../../storage/store";


export class LiveStreamService {

  secureUrl(url,data){
    data["proxy_url"] = url;
    const store = new Store();
    let headers = {};
    if (store.state && store.state.credentials.token) {
      headers.authorization = `bearer ${store.state.credentials.token}`;
    }
    return new Promise((resolve, reject) => {
      axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/api/v1/secure/proxy", data,{
        headers:headers
      }).then(resp => {
        resolve(resp);
      }).catch(reason => {
        reject(reason);
      });
    })
  }

  async createStream(is360){
    return new Promise((resolve, reject) => {
      const randDigits = Math.floor(100000 + Math.random() * 900000);
      const name = "live-" + (is360 ? "360-" : "2d-" )+ randDigits;
      this.secureUrl(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/live/create", {
        name: name
      }).then(resp => {
        const entry = resp.data;
        resolve(entry);
      }).catch(reason => {
        reject(reason);
      });
    })
  }

  removeStream(){

  }

}

export const liveStreamService = new LiveStreamService();