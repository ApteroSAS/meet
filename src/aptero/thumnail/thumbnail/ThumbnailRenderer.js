import { AmbientLight, DirectionalLight, PerspectiveCamera, Box3, Vector3, Scene } from "three";
import { getCanvasBlob } from "../utils/thumbnails";
import makeRenderer from "./makeRenderer";
import { loadGLTF } from "../../../components/gltf-model-plus";
import { findNode } from "../../../utils/three-utils";
import { createDefaultEnvironmentMap } from "../../../components/environment-map";
import {propertiesService} from "../../../propertiesService";

import axios from "axios";

const ORBIT_ANGLE = new THREE.Euler(-30 * THREE.Math.DEG2RAD, 30 * THREE.Math.DEG2RAD, 0);
const DEFAULT_MARGIN = 1;
const TEXTURE_PROPS = {
  base_map: ["map"],
  emissive_map: ["emissiveMap"],
  normal_map: ["normalMap"],
  orm_map: ["aoMap", "roughnessMap", "metalnessMap"]
};

export default class ThumbnailRenderer {
  constructor() {
    this.available = false;
  }

  getFreeRenderer() {
    if (this.available) {
      return this.renderer;
    } else {
      return makeRenderer(512, 512);
    }
  }

  fitBoxInFrustum(camera, box, center, margin = DEFAULT_MARGIN) {
    const maxHalfExtents = Math.max(box.max.y - center.y, center.y - box.min.y, box.max.x - center.x, center.x - box.min.x, box.max.z - center.z, center.z - box.min.z);
    //const halfVertFOV = THREE.Math.degToRad(camera.fov / 2);
    //camera.position.set(0, 0, (halfYExtents / Math.tan(halfVertFOV)) * margin);
    camera.position.set(0, 0, maxHalfExtents * margin * 2);
    camera.position.applyEuler(ORBIT_ANGLE);
    camera.position.add(center);
    camera.lookAt(center);
  }

  generateThumbnailFromUrl(url) {
    return new Promise((resolve, reject) => {
      const preferredTechnique = window.APP && window.APP.quality === "low" ? "KHR_materials_unlit" : "pbrMetallicRoughness";
      this.loadPreviewGLTF(url, "model/gltf", preferredTechnique, null, null).then(gltf => {
        console.log(gltf);
        this.generateThumbnail(gltf).then((blob) => {
          const reader = new FileReader();
          reader.onload = function() {
            // Since it contains the Data URI, we should remove the prefix and keep only Base64 string
            const b64 = reader.result;
            console.log(b64);
            resolve(b64);
          };
          // Since everything is set up, let’s read the Blob and store the result as Data URI
          reader.readAsDataURL(blob);
        }).catch(reason => {
          reject(reason);
        });
      }).catch(reason => {
        reject(reason);
      });
    });
  }


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

  generateThumbnail = async (glb, width = 256, height = 256) => {
    const renderer = this.getFreeRenderer();
    if (renderer === this.renderer) {
      this.available = false;
    }
    const scene = new Scene();
    scene.add(glb);

    const light1 = new AmbientLight(0xffffff, 0.3);
    scene.add(light1);

    const light2 = new DirectionalLight(0xffffff, 0.8 * Math.PI);
    light2.position.set(0.5, 0, 0.866);
    scene.add(light2);

    const camera = new PerspectiveCamera();
    scene.add(camera);
    camera.matrixAutoUpdate = true;

    scene.children.forEach(object => {
      object.updateMatrixWorld();
    });

    const box = new Box3().setFromObject(glb);
    const center = box.getCenter(new Vector3());

    camera.near = 0.1;
    camera.far = 10000;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    camera.layers.disable(1);

    this.fitBoxInFrustum(camera, box, center, 1.7);
    camera.updateMatrix();
    camera.updateMatrixWorld();

    renderer.setSize(width, height, true);
    renderer.render(scene, camera);

    const blob = await getCanvasBlob(renderer.domElement);

    if (renderer === this.renderer) {
      this.available = true;
    }
    return blob;
  };

  async loadPreviewGLTF(gltfGltfUrl) {
    let gltf;
    try {
      const preferredTechnique = window.APP && window.APP.quality === "low" ? "KHR_materials_unlit" : "pbrMetallicRoughness";
      gltf = await loadGLTF(gltfGltfUrl, "model/gltf", preferredTechnique, null, null);
    } catch (e) {
      console.error("Failed to load gltf preview", e);
      return;
    }

    // TODO Check for "Bot_Skinned" here is a hack for legacy gltfs which only has a name one of the MOZ_alt_material nodes
    this.previewMesh = findNode(
      gltf.scene,
      n => (n.isMesh && n.material)
    );

    if (!this.previewMesh) {
      console.error("Failed to find gltf preview mesh");
      return;
    }

    const { material } = this.previewMesh;
    if (material) {
      // We delete onUpdate here to opt out of the auto texture cleanup after GPU upload.
      const getImage = p => material[p] && delete material[p].onUpdate && material[p].image;
      this.originalMaps = {
        base_map: TEXTURE_PROPS["base_map"].map(getImage),
        emissive_map: TEXTURE_PROPS["emissive_map"].map(getImage),
        normal_map: TEXTURE_PROPS["normal_map"].map(getImage),
        orm_map: TEXTURE_PROPS["orm_map"].map(getImage)
      };

      await Promise.all([
        createDefaultEnvironmentMap().then(t => {
          this.previewMesh.material.envMap = t;
          this.previewMesh.material.needsUpdate = true;
        })
      ]);
    } else {
      this.originalMaps = {};
    }

    return gltf.scene;
  }
}
