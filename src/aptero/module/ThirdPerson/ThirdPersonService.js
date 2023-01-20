
export class ThirdPersonService{
  async start(){
    window.APP.store.addEventListener("statechanged", this.storeUpdated);
    window.addEventListener("apt_scene_entered",()=>{
      setTimeout(()=>{
        this.storeUpdated();
      },0);
    },{once:true});
    this.storeUpdated();
  }

  storeUpdated = () => {
    const thirdPersonMode = window.APP.store.state.preferences["thirdPersonMode"];
    if(AFRAME.scenes[0]) {
      AFRAME.scenes[0].systems["hubs-systems"].cameraSystem.setThirdPersonMode(thirdPersonMode);
    }
  };

  async stop(){
    window.APP.store.removeEventListener("statechanged", this.storeUpdated);
  }
}
