import { roomParameters } from "../HubsBridge/service/RoomParameters";


export class CustomMenuService{
  getButtonTitle(){
    return roomParameters?.roomConfig?.customButton?.title;
  }

  getIframeContentURL(){
    return roomParameters?.roomConfig?.customButton?.iframeUrl;
  }

  isActivated(){
    return roomParameters?.roomConfig?.customButton;
  }
}

export const customMenuService = new CustomMenuService();
