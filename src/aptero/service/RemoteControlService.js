import { propertiesService } from "../properties/propertiesService";

const io = require("socket.io-client");

export class RemoteControlService {
    lastMoveTime = 0;
    remoteScreenSessionIdMap = {};
    screenSize={};
    socketState = "disconnected";
    lastX=0;
    lastY=0;
    lastSessionID = "";

    registerEventOnElement(el) {
        el.object3D.addEventListener("interact", this.onInteract);
        el.object3D.addEventListener("hovered", ()=>{console.log("hovered")});
        el.object3D.addEventListener("unhovered", ()=>{console.log("unhovered")});
        // Register event listeners for mouse and keyboard.
        //el.addEventListener( 'ui-mousemove', this.mousemove, false );
        //el.addEventListener( 'mousedown', this.mousedown, false );
        //el.addEventListener( 'mouseup', this.mouseup, false );
        //el.addEventListener( 'touchstart', this.mousedown, false );
        //el.addEventListener( 'touchend', this.mouseup, false );
        //el.addEventListener( 'dblclick', this.dblclick, false);
        //el.addEventListener( 'ui-mousewheel', this.mousewheel, false);
        //document.addEventListener('keyup', this.keyup, false);
        //document.addEventListener('keydown', this.keydown, false);
    }

    unregisterEventOnElement(el) {
        // Unregister event listeners for mouse and keyboard.
        //el.removeEventListener('ui-mousemove',this.mousemove);
        //el.removeEventListener('mousedown',this.mousedown);
        //el.removeEventListener('mouseup',this.mouseup);
        //el.removeEventListener('touchstart',this.mousedown);
        //el.removeEventListener('touchend',this.mouseup);
        //el.removeEventListener( 'dblclick', this.dblclick);
        //el.removeEventListener( 'ui-mousewheel', this.mousewheel);
        //document.removeEventListener('keyup', this.keyup);
        //document.removeEventListener('keydown', this.keydown);
    }

    onKeyup = (e) => {
        this.keyEvent("keyup", e);
    };
    onKeydown = (e) => {
        this.keyEvent("keydown", e);
    };
    onMouseUp = (e) => {
        this.mouseEvent("mouseup", e);
    };
    onMouseDown = (e) => {
        this.mouseEvent("mousedown", e);
    };
    onMouseWheel = (e) => {
        this.mouseEvent("mousewheel", e);
    };

    mouseEvent(type, e) {
        let mouse = { x: 0, y: 0 };
        // Store the delta for mousewheel events.
        if (type === "mousewheel" && e.detail.evt) {
            mouse.deltaY = e.detail.evt.deltaY;
            mouse.deltaX = e.detail.evt.deltaX;
        }
        this.sendMouseEvent(type, e, mouse);
    }

    onInteract = (e) => {
        if (this.socket) {
            {
                const _event = {
                    type: "mousedown",
                    x: this.lastX,
                    y: this.lastY,
                    button: "left",
                    globalX: e.x,
                    globalY: e.y,
                    movementX: this.lastX,
                    movementY: this.lastY,
                    clickCount: 1
                };
                // Send the event to electron over the websocket.
                this.socket.emit("event-" + this.lastSessionID, _event);
            }
            {
                const _event = {
                    type: "mouseup",
                    x: this.lastX,
                    y: this.lastY,
                    button: "left",
                    globalX: e.x,
                    globalY: e.y,
                    movementX: this.lastX,
                    movementY: this.lastY,
                    clickCount: 1
                };
                // Send the event to electron over the websocket.
                this.socket.emit("event-" + this.lastSessionID, _event);
            }
        }
    };

    sendMouseEvent(type, e, mouse) {
        let _event;
        let _button;
        if (event.detail.evt) {
            // Convert the mouse button value to a string for electron webcontents.
            switch (event.detail.evt.button) {
                case 0:
                    _button = "left";
                    break;
                case 1:
                    _button = "middle";
                    break;
                case 2:
                    _button = "right";
                    break;
            }
        }
        switch (type) {
            case "mouseup":
            case "mousedown":
                // Set minimum options for mouse events.
                _event = {
                    type: type,
                    x: mouse.x,
                    y: mouse.y,
                    button: _button || "left",
                    globalX: mouse.x,
                    globalY: mouse.y,
                    movementX: 0,
                    movementY: 0,
                    clickCount: 1
                };
                break;
            case "mousewheel":
                // Set minimum options for mousewheel events.
                _event = {
                    type: type,
                    x: mouse.x,
                    y: mouse.y,
                    button: 3,
                    globalX: mouse.x,
                    globalY: mouse.y,
                    movementX: 0,
                    movementY: 0,
                    clickCount: 1,
                    deltaX: -mouse.deltaX,
                    deltaY: -mouse.deltaY,
                    wheelTicksX: 0,
                    wheelTicksY: 0,
                    accelerationRatioX: 1,
                    accelerationRatioY: 1,
                    hasPreciseScrollingDeltas: true,
                    canScroll: true
                };
                break;
        }
        if (_event && this.socket) {
            // Send the event to electron over the websocket.
            this.socket.emit("event-" + this.lastSessionID, _event);
        }
    }

    keyEvent = (type, e) => {
        // Setup modifiers array and populate form the key events.
        let modifiers = [];
        if (e.ctrlKey) {
            modifiers.push("control");
        }
        if (e.altKey) {
            modifiers.push("alt");
        }
        if (e.metaKey) {
            modifiers.push("meta");
        }
        if (e.shiftKey) {
            modifiers.push("shift");
        }
        if (e.repeat) {
            modifiers.push("isAutoRepeat");
        }
        // if(e.key === 'CapsLock'){
        //     modifiers.push('capsLock');
        // }
        // let s = String.fromCharCode( e.which );
        // if ( s.toUpperCase() === s && s.toLowerCase() !== s && !e.shiftKey ) {
        //     alert('caps is on');
        //     modifiers.push('capsLock');
        // }
        if (this.socket) {
            this.socket.emit("event-" + this.lastSessionID, {
                type: type,
                keyCode: e.key,
                modifiers: modifiers
            });
            // If is an alphanumeric key then send the char event also to get the text to show up in the input fields
            // Do not send if this is a modified keypress i.e. Ctrl+A, Ctrl+V
            if (e.which <= 90 && e.which >= 48 && type === "keyup" && !modifiers.length) {
                this.socket.emit("event-" + this.lastSessionID, {
                    type: "char",
                    keyCode: e.key
                    //modifiers:modifiers
                });
            }
        }
    };

    registerIdScreen(idScreen, idRobotjs) {
        //1er step setup: (media view) tu recupere l'id du share screen + via api rest l'id du robot js et tu envois au serveur SocketIO.
        console.log(idScreen, idRobotjs);
    }

    async tryConnect() {
        return new Promise((resolve, reject) => {
            if (this.socketState === "disconnected") {
                this.socketState = "connecting";
                this.socket = io.connect(propertiesService.RETICULUM_SERVER, { path: "/service/remote/orchestrator/socket.io" });
                //this.socket = io.connect("http://localhost:3443", { path: "/service/web-renderer/socket.io" });
                this.socket.once("init_ok", () => {
                    resolve(true);
                    this.socketState = "connected";
                });
                this.socket.on("connect_error", () => {
                    console.error("socket connect_error");
                    this.socket.disconnect();
                    this.socketState = "disconnected";
                    reject("socket connect_error");
                });
                //window.APP.store.credentialsAccountId
                //this.socket.emit("connection", {sessionClientId: NAF.clientId})
            } else if (this.socketState === "connecting") {
                this.socket.once("init_ok", () => {
                    resolve(true);
                    this.socketState = "connected";
                });
            } else if (this.socketState === "connected") {
                resolve(true);
            }
        });
    }

    updateCursorPosition(remoteScreenSessionId, mouseRatioX, mouseRatioY) {
        this.lastSessionID = remoteScreenSessionId;
        if (this.socket) {
            //TODO send less data
            let mouseX = this.screenSize[remoteScreenSessionId].width * mouseRatioX;
            let mouseY = this.screenSize[remoteScreenSessionId].height * (mouseRatioY-1)*-1;
            this.lastX =mouseX;
            this.lastY =mouseY;
            let _event = {
                type: "mousemove",
                x: mouseX,
                y: mouseY,
                button: "left",
                globalX: mouseX,
                globalY: mouseY,
                movementX: 0,
                movementY: 0,
                clickCount: 1
            };
            this.socket.emit("event-" + remoteScreenSessionId, _event);
        }
    }

    getNewRemoteSessionID() {
        return window.APP.store.credentialsAccountId?window.APP.store.credentialsAccountId:("anonymous"+Math.floor(Math.random()*10000000));
    }

    async connectVRScreenToRemoteScreen(NAFscreenID, remoteScreenSessionId,width,height,startUrl) {
        await this.tryConnect();
        this.remoteScreenSessionIdMap[NAFscreenID] = remoteScreenSessionId;
        this.screenSize[remoteScreenSessionId]={
            width,
            height
        };
        this.socket.emit("connect_screen", {
            localSessionID: NAFscreenID,
            remoteScreenSessionId: remoteScreenSessionId,
            screenSizeX:width,
            screenSizeY:height,
            startUrl:startUrl
        });
    }

    async registerOnFrame(localSessionID, remoteScreenSessionId,width,height,startUrl, callback) {
        await this.tryConnect();
        this.socket.on("frame-" + remoteScreenSessionId, buffer => {
            callback(buffer);
        });
        await this.connectVRScreenToRemoteScreen(localSessionID, remoteScreenSessionId,width,height,startUrl);
    }

    tryCaptureCursor(intersection) {
        if (intersection) {
            if (intersection?.object?.el?.components["media-video"]?.el === intersection?.object?.el) { // check type of object
                NAF.utils
                    .getNetworkedEntity(intersection.object.el)
                    .then(networkedEl => {
                        let screenId = networkedEl.components.networked.data.networkId; // id screen
                        if (this.remoteScreenSessionIdMap[screenId]) {
                            if (new Date().getTime() - this.lastMoveTime < 50) {
                                return;
                            }
                            this.lastMoveTime = new Date().getTime();
                            let mouseRatioX = intersection?.uv?.x;
                            let mouseRatioY = intersection?.uv?.y;
                            this.updateCursorPosition(this.remoteScreenSessionIdMap[screenId], mouseRatioX, mouseRatioY);
                        }
                    });
            }
        }
    }
}

export const remoteControlService = new RemoteControlService();


