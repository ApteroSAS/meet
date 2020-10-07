import axios from "axios";
import { propertiesService } from "../properties/propertiesService";
import Store from "../../storage/store";


export class LiveStreamService {

  constructor(){}

  async start(){
    //if no stream create one 360 and one 2d
    {
      try {
        let retData = await this.listStream(true);
        if (retData && retData.entries.length === 0) {
          await this.createStream(true);
        }
      }catch (e) {
        //ignore this error
        //401 can happens in case the user is not logged
      }
    }
    {
      try {
        let retData = await this.listStream(false);
        if (retData && retData.entries.length === 0) {
          await this.createStream(false);
        }
      }catch (e) {
        //ignore this error
        //401 can happens in case the user is not logged
      }
    }
  }

  secureUrl(url,data){
    data["proxy_url"] = url;
    const store = new Store();
    let headers = {};
    return new Promise((resolve, reject) => {
      if (store.state && store.state.credentials.token) {
        headers.authorization = `bearer ${store.state.credentials.token}`;
        axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/api/v1/secure/proxy", data,{
          headers:headers
        }).then(resp => {
          resolve(resp);
        }).catch(reason => {
          reject(reason);
        });
      }else{
        reject("unauthorized")
      }
    })
  }

  async listStream(is360){
    return new Promise((resolve, reject) => {
      const filter = "live-" + (is360 ? "360-" : "2d-" );
      this.secureUrl(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/live/get", {
        filter: filter
      }).then(resp => {
        const reticulumData = resp.data;
        resolve(reticulumData);
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

export const liveStream = new LiveStreamService();