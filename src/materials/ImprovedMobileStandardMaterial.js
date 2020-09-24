import { Color, MeshPhongMaterial } from "three";
//TODO move improved material in apteo pacjkage
export default class StandardMaterial extends THREE.ShaderMaterial {
  type = "StandardMaterial";
  isStandardMaterial = true;
  static fromStandardMaterial(material) {
    material.emissive = material.emissive || new Color(0,0,0);
    const parameters = {
      fog: true,
      //lights: true,
      opacity: material.opacity,
      transparent: material.transparent,
      alphaTest: material.alphaTest,
      skinning: material.skinning,
      morphTargets: material.morphTargets,
      vertexColors: material.vertexColors,
      name: material.name
    };

    //const mobileMaterial = new MeshStandardMaterial(parameters); //8fps
    //const mobileMaterial = new MeshBasicMaterial(parameters); //not working
    const mobileMaterial = new MeshPhongMaterial(parameters); //13fps
    //const mobileMaterial = new MeshLambertMaterial(parameters); // 9-19 fps

    mobileMaterial.color = material.color;
    mobileMaterial.map = material.map;
    mobileMaterial.aoMap = material.aoMap;
    mobileMaterial.aoMapIntensity = material.aoMapIntensity;
    mobileMaterial.emissive = material.emissive;
    mobileMaterial.emissiveMap = material.emissiveMap;
    mobileMaterial.emissiveIntensity = material.emissiveIntensity || 1;

    return mobileMaterial;
  }
  clone() {
    return StandardMaterial.fromStandardMaterial(this);
  }
}