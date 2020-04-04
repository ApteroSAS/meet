import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { createDefaultEnvironmentMap } from "../components/environment-map";

//https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
//https://hub.aptero.co/data/data/envmap.png

export default class ImprovedStandardMaterial extends THREE.ShaderMaterial {
  type = "ImprovedStandardMaterial";
  isStandardMaterial = true;
  exrCubeRenderTarget;
  exrBackground;
  pngCubeRenderTarget;
  pngBackground;

  static fromStandardMaterial(material) {
    createDefaultEnvironmentMap().then((envmap)=>{
      material.envMap = envmap;
      material.needsUpdate = true;
    });

    return material;
  }

  clone() {
    return ImprovedStandardMaterial.fromStandardMaterial(this);
  }
}
