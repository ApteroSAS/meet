import MobileStandardMaterial from "../../materials/MobileStandardMaterial";
import ImprovedMobileStandardMaterial from "../../materials/ImprovedMobileStandardMaterial";
import ImprovedStandardMaterial from "../../materials/ImprovedStandardMaterial";

export function getPreferredTechnique(){
  return window.APP && window.APP.quality === "low" ? "KHR_materials_unlit" : "pbrMetallicRoughness";
}

export function isOculusQuest(){
  return AFRAME.utils.device.isMobileVR() && (/(X11; Linux x86_64)/.test(navigator.userAgent));
}

export function isOculusGo(){
  return AFRAME.utils.device.isMobileVR() && (/(Linux; Android .....;Pacific)/.test(navigator.userAgent));
}

export function computeDefaultAppQuality(){
  /*
  Target quality
  Smartphone and oculus go => low
  Oculus Quest => medium
  PC baked => high (but for uniformity reason we also target medium)
   */
  const isMobile = AFRAME.utils.device.isMobile();
  if(isMobile || isOculusGo()){
    return "low"
  }else if(isOculusQuest()){
    return "medium"
  }else{
    return "medium"
  }
}

export function computeAppQuality(){
  return window.APP.store.state.preferences.materialQualitySetting? window.APP.store.state.preferences.materialQualitySetting: computeDefaultAppQuality();
}

export function shadowActivated(){
  return window.APP && (window.APP.quality !== "low" || window.APP.quality !== "medium");
}

export function directionalLightActivated(){
  return window.APP && window.APP.quality !== "low" || window.APP.quality !== "medium";
}

export function lowQualityWater(){
  return window.APP && (window.APP.quality === "low" || window.APP.quality === "medium");
}

export function getMaterialImpl(options,material) {
  if(!material) {
    material = new THREE.MeshStandardMaterial(options);
  }
  if (material.isMeshStandardMaterial && getPreferredTechnique() === "KHR_materials_unlit" && window.APP && window.APP.quality === "low") {
    return MobileStandardMaterial.fromStandardMaterial(material);
  } else if (window.APP && window.APP.quality === "medium") {
    return ImprovedMobileStandardMaterial.fromStandardMaterial(material);
  } else if (material.name.startsWith("PBR_")) {
    return ImprovedStandardMaterial.fromStandardMaterial(material);
  } else {
    return material;
  }
}

export class DeviceDetector{

}

console.log(" is ",isOculusQuest(),isOculusGo());