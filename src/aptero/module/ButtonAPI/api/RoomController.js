//deprecated
export class RoomController{

    setEntryMode(mode){
        if(this.hub){
            this.hub.entry_mode=mode;//allow or invite
            this.hubChannel.updateHub(this.hub);
        }
    }

    setRoom(hub,hubChannel){
        this.hub = hub;
        this.hubChannel = hubChannel;
    }
}

export const roomController = new RoomController();