import { propertiesService } from "../../properties/propertiesService";

import axios from "axios";

export default class RemoteThumbnailRenderer {
  cache = {};

  getLocalCacheFor = (glbFileUrl)=>{
    return this.cache[glbFileUrl];
  };

  generateThumbnailFromUrlRemote = async (glbFileUrl) => {
    return new Promise((resolve, reject) => {
      axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/thumbnail/compute/hash", { url: glbFileUrl }).then(data => {
        const res = data.data;
        const hash = res.hash;
        axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/thumbnail/get", { hash: hash }).then(data => {
          const res = data.data;
          const imageUrl = res.url;
          if (imageUrl && imageUrl !== "NO_CACHE") {
            this.cache[glbFileUrl]=imageUrl;//local cache
            resolve(imageUrl);
          } else {
            axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/thumbnail/generate", { url: glbFileUrl }).then(data => {
              const res = data.data;
              const imageUrl = res.url;
              this.cache[glbFileUrl]=imageUrl;//local cache
              resolve(imageUrl);
            }).catch(reason => {
              reject(reason);
            });
          }
        }).catch(reason => {
          reject(reason);
        });
      }).catch(reason => {
        reject(reason);
      });
    });
  };
}
