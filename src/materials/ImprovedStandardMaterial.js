import { Color, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
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

  /*static initMaterial(material) {
    const renderer = new THREE.WebGLRenderer();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    //pmremGenerator.compileEquirectangularShader();

    // eslint-disable-next-line no-undef
    /*
    https://threejs.org/examples/webgl_materials_envmaps_exr.html
		import { EXRLoader } from './jsm/loaders/EXRLoader.js';
    new EXRLoader()
      .setDataType(THREE.FloatType)
      .load("https://hub.aptero.co/data/data/envmap.exr", (texture) => {

        this.exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        this.exrBackground = this.exrCubeRenderTarget.texture;

        texture.dispose();

      });*//*

    new THREE.TextureLoader().load("https://hub.aptero.co/data/data/envmap.png", (texture) => {

      texture.encoding = THREE.sRGBEncoding;

      this.pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      this.pngBackground = this.pngCubeRenderTarget.texture;
      texture.dispose();

      material.envMap = this.pngCubeRenderTarget.texture;
      material.map = this.pngCubeRenderTarget.texture;
      material.needsUpdate = true;
      console.log("envmap udated");
    });
  }*/

  static fromStandardMaterial(material) {
    material.emissive = material.emissive || new Color(0, 0, 0);
    const parameters = {
      uniforms: {
        uvTransform: { value: new THREE.Matrix3() },
        diffuse: { value: material.color },
        opacity: { value: material.opacity },
        map: { value: material.map },
        aoMapIntensity: { value: material.aoMapIntensity },
        aoMap: { value: material.aoMap },
        emissive: { value: material.emissive },
        emissiveMap: { value: material.emissiveMap }
      },
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

    const newMaterial = new MeshStandardMaterial(parameters); //8fps
    //const newMaterial = new MeshBasicMaterial(parameters); //not working
    //const newMaterial = new MeshPhongMaterial(parameters); //13fps
    //const newMaterial = new MeshLambertMaterial(parameters); // 9-19 fps
    //const newMaterial = new MeshPhysicalMaterial(parameters);

    createDefaultEnvironmentMap().then((envmap)=>{
      newMaterial.envMap = envmap;
      newMaterial.needsUpdate = true;
    });

    newMaterial.roughness = material.roughness | 0;
    newMaterial.metalness = material.metalness | 0.2;
    //newMaterial.envMap = null;
    //newMaterial.map = null;

    newMaterial.color = material.color;
    newMaterial.map = material.map;
    newMaterial.aoMap = material.aoMap;
    newMaterial.aoMapIntensity = material.aoMapIntensity;
    newMaterial.envMapIntensity = 1.0;
    newMaterial.emissive = material.emissive;
    newMaterial.emissiveMap = material.emissiveMap;
    newMaterial.emissiveIntensity = material.emissiveIntensity || 1;

    return newMaterial;
  }

  clone() {
    return ImprovedStandardMaterial.fromStandardMaterial(this);
  }
}
