import { mediaLimiter } from "./MediaLimiter";
import { ActionController } from "./ActionController";

export class GLTFExtensionProcessorService {
  constructor(){
    this.actionController = new ActionController();
  }

  async start() {
    await this.actionController.start();
  }

  processMeshFile(rootMesh,sceneuuid) {
    rootMesh.children.forEach(mesh => {
      const meshuuid = mesh.uuid;
      const meshName = mesh.name;
      const el = mesh.el;
      if(mesh.children){
        this.processMeshFile(mesh,sceneuuid);
      }
      if (mesh.userData) {
        Object.keys(mesh.userData).forEach((value, masterindex) => {
          let jsonData = mesh.userData[value];
          if (value.startsWith("apt.action.controller")) {
            if(!el.id){
              el.setAttribute("id",sceneuuid+"_"+meshuuid+"_"+masterindex+"_random_id")//TODO add random id
            }
            this.actionController.process(jsonData,el.id,sceneuuid,meshuuid,meshName,masterindex);
          }
          if (value === "apt.limit.pdf") {
            mediaLimiter.setLimit(jsonData);
          }
        });
      }
    });
  }

  processGltfFile(children,sceneuuid) {
    let root = {children};
    this.processMeshFile(root,sceneuuid);
  }
}

export const gltfExtensionProcessorService = new GLTFExtensionProcessorService();
