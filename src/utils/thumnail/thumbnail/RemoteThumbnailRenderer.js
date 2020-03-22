import { properties } from "../../../properties";

import axios from "axios";

export default class RemoteThumbnailRenderer {

  generateThumbnailFromUrlRemote = async (glbFileUrl) => {
    return new Promise((resolve, reject) => {
      axios.post(properties.PROTOCOL + properties.RETICULUM_SERVER + "/thumbnail/compute/hash", { url: glbFileUrl }).then(data => {
        const res = data.data;
        const hash = res.hash;
        axios.post(properties.PROTOCOL + properties.RETICULUM_SERVER + "/thumbnail/get", { hash: hash }).then(data => {
          const res = data.data;
          const imageUrl = res.url;
          if (imageUrl && imageUrl !== "NO_CACHE") {
            resolve(imageUrl);
          } else {
            axios.post(properties.PROTOCOL + properties.RETICULUM_SERVER + "/thumbnail/generate", { url: glbFileUrl }).then(data => {
              const res = data.data;
              const imageUrl = res.url;
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
