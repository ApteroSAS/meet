export class MediaLimiter{
  removeOrder = [];
  limit = 99999;
  pushMedia(el){
    try {
      this.removeOrder.splice(0, 0, el);//insert at 0
      while (this.removeOrder.length > this.limit) {
        let elToRemove = this.removeOrder.pop();
        elToRemove.components["media-limiter"].remove();
      }
    }catch (e) {
      console.error(e);
    }
  }

  setLimit(limite){
    this.limit=limite;
  }

}

export const mediaLimiter = new MediaLimiter();
mediaLimiter.setLimit(3);