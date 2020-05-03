import { propertiesService } from "../../../propertiesService";

import axios from "axios";

export default class RemoteThumbnailRenderer {

  generateThumbnailFromUrlRemote = async (glbFileUrl) => {
    return new Promise((resolve, reject) => {
      axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/thumbnail/compute/hash", { url: glbFileUrl }).then(data => {
        const res = data.data;
        const hash = res.hash;
        axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/thumbnail/get", { hash: hash }).then(data => {
          const res = data.data;
          const imageUrl = res.url;
          if (imageUrl && imageUrl !== "NO_CACHE") {
            resolve(imageUrl);
          } else {
            axios.post(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/thumbnail/generate", { url: glbFileUrl }).then(data => {
              const res = data.data;
              const imageUrl = res;
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
