import classNames from "classnames";
import React from "react";
import { liveStream } from "../../video360/LiveStream";
import { remoteControlServiceV2 } from "../../RemoteScreen/RemoteControlServiceV2";
import CreateAvatar from "../../AvatarReadyPlayerMe/CreateAvatar";
import styles from "./scss/component/MediaTiles.scss";
import PropTypes from "prop-types";
import { lastVideoShareData } from "../../ButtonAPI/service/ChangeVideoService";


export const WEB_BROWSER_URL_MODE = "web-browser";

function BaseTile({ as: TileComponent, className, name, description, tall, wide, children, ...rest }) {
  let additionalProps;

  if (TileComponent === "div") {
    additionalProps = {
      tabIndex: "0",
      role: "button"
    };
  }

  return (
    <TileComponent
      className={classNames(styles.mediaTile, { [styles.tall]: tall, [styles.wide]: wide }, className)}
      {...additionalProps}
      {...rest}
    >
      <div className={styles.thumbnailContainer}>{children}</div>
      {(name || description) && (
        <div className={styles.info}>
          <b>{name}</b>
          {description && <small className={styles.description}>{description}</small>}
        </div>
      )}
    </TileComponent>
  );
}

BaseTile.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.node,
  children: PropTypes.node,
  tall: PropTypes.bool,
  wide: PropTypes.bool
};

BaseTile.defaultProps = {
  as: "div"
};

export class MediaTilesLib {
  sessionCache = {};
  displayWebBrowserTile = false;

  setPropsAndState(parent, props, state) {
    this.parent = parent;
    this.props = props;
    this.state = state;
    this.handleEntryClicked = this.parent.handleEntryClicked;
  }

  getTileDimensions(isImage, isAvatar, imageAspect) {
    // Doing breakpointing here, so we can have proper image placeholder based upon dynamic aspect ratio
    const clientWidth = window.innerWidth;
    let imageHeight = clientWidth < 1079 ? (clientWidth < 768 ? (clientWidth < 400 ? 85 : 100) : 150) : 200;
    if (isAvatar) imageHeight = Math.floor(imageHeight * 1.5);

    // Aspect ratio can vary per image if its an image result. Avatars are a taller portrait aspect, o/w assume 720p
    let imageWidth;
    if (isImage) {
      imageWidth = Math.floor(Math.max(imageAspect * imageHeight, imageHeight * 0.85));
    } else if (isAvatar) {
      imageWidth = Math.floor((9 / 16) * imageHeight);
    } else {
      imageWidth = Math.floor(Math.max((16 / 9) * imageHeight, imageHeight * 0.85));
    }

    return [imageWidth, imageHeight];
  }

  createStreamTile() {
    const clickAction = (e) => {
      this.handleEntryClicked && this.handleEntryClicked(e, { createLiveEntry: true });
    };
    let img = "/assets/static/app-thumbnail.png";
    let title = "Create à new live stream" || "\u00A0";
    return this.createStandardTile(clickAction,img,title);
  }

  createStandardTile(clickAction,imgSrc,title){
    /*const [imageWidth, imageHeight] = this.getTileDimensions(false, false, 16 / 9);
    return (<div style={{ width: `${imageWidth}px` }} className={styles.tile} key={title}>
      <a rel="noreferrer noopener"
        onClick={clickAction}
        className={styles.tileLink}
        style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
      ><img
        className={classNames(styles.tileContent, styles.avatarTile)}
        style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        src={imgSrc}
      />
      </a>
      <div className={styles.info}>
        <a
          rel="noreferrer noopener"
          className={styles.name}
          style={{ textAlign: "center" }}
          onClick={clickAction}
        >
          {title}
        </a>
      </div>
    </div>);*/
    
    return <BaseTile onClick={clickAction} className={styles.createTile} wide={true} tall={false} key={title} name={title}>
      <div className={styles.createTileContent}>
        <img
          src={imgSrc}
        />
        <p>{title}</p>
      </div>
    </BaseTile>
  }

  

  createShareScreenTile() {
    const clickAction = (e) => {
      this.handleEntryClicked && this.handleEntryClicked(e, { shareScreen: {} });
    };
    let img = "/assets/static/share-screen.png";
    let title = "Share your screen" || "\u00A0";
    return this.createStandardTile(clickAction,img,title);
  }

  createWebcamTile(device) {
    const clickAction = (e) => {
      this.handleEntryClicked && this.handleEntryClicked(e, { camera: device });
    };
    let img = "/assets/static/camera-thumbnail.png";
    let title = device.label || "\u00A0";
    return this.createStandardTile(clickAction,img,title);
  }

  createWebBrowserTile() {
    const clickAction = (e) => {
      this.handleEntryClicked && this.handleEntryClicked(e, {
        url: WEB_BROWSER_URL_MODE,
        webBrowser: { sessionID: remoteControlServiceV2.getNewRemoteSessionID() }
      });
    };
    let img = "/assets/static/camera-thumbnail.png";
    let title = "Web Browser";
    return this.createStandardTile(clickAction,img,title);
  }

  createWebcamTiles() {
    //1 try to update the camera list
    let camlist = this.state.webcamlist || {};
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach((device) => {
        //console.log(device.kind + ": " + device.label +" id = " + device.deviceId);
        if (device.kind === "videoinput") {
          camlist[device.deviceId] = device;
        }
      });
      if (!this.state.webcamlist || (Object.keys(this.state.webcamlist).length !== Object.keys(camlist).length)) {
        this.parent.setState({ webcamlist: camlist });
      }
    }).catch((err) => {
      console.log(err.name + ": " + err.message);
    });

    return Object.keys(camlist).map(key => {
      return this.createWebcamTile(camlist[key]);
    });
  }

  showEmptyStringOnNoResult(){
    if(this.props.history){
      return !((this.props.history.location.search.search("live") !== -1) ||
        (this.props.history.location.search.search("live") !== -1) ||
       (this.props.history && this.props.history.location.search.search("live") !== -1 && this.props.history.location.search.search("360") === -1))
    }else{
      return true;
    }
  }

  createAdditionalTiles() {
    return <React.Fragment>
      {(this.props.history && (this.props.history.location.search.search("live") !== -1) && this.displayWebBrowserTile) && this.createWebBrowserTile()}
      {(this.props.history && this.props.history.location.search.search("live") !== -1) && this.createWebcamTiles()}
      {(this.props.history && this.props.history.location.search.search("live") !== -1 && this.props.history.location.search.search("360") === -1) && this.createShareScreenTile()}
    </React.Fragment>;
  }

}

export function completeEntry (entry,is360,selectAction) {
  if(!entry){
    return;
  }
  if (entry.shareScreen) {
    entry.shareScreen.type = is360 ? "360-equirectangular" : "2d";
    entry.shareScreen.selectAction = selectAction;
    lastVideoShareData.data =  entry.shareScreen;
    AFRAME.scenes[0].emit("action_end_video_sharing");
    setTimeout(()=>{
      AFRAME.scenes[0].emit(`action_share_screen`,"change_screen_to_share_screen");
    },0)
  } else if (entry.webBrowser) {
    entry.webBrowser.type = is360 ? "360-equirectangular" : "2d";
    entry.webBrowser.selectAction = selectAction;
  } else if (entry.camera) {
    entry.camera.type = is360 ? "360-equirectangular" : "2d";
    entry.camera.selectAction = selectAction;
    lastVideoShareData.data =  entry.camera;
    AFRAME.scenes[0].emit("action_end_video_sharing");
    setTimeout(()=> {
      AFRAME.scenes[0].emit("action_share_camera", "change_screen_to_camera");
    },0);
  }
  return entry;
}

export const mlHandleEntryClicked = (evt, entry, parent) => {
  evt.preventDefault();
  if(!entry){
    return;
  }
  let is360 = false;
  if(parent) {
    const searchParams = new URLSearchParams(parent.props.history.location.search);
    const urlSource = parent.getUrlSource(searchParams);
    is360 = urlSource === "videos360";
  }
  if (entry.createLiveEntry) {
    liveStream.createStream(is360).then(entry => {
      parent.setState((state) => {
        const newState = { ...state };
        newState.result.entries.push(entry);
        return newState;
      });
    });
  }else if (entry.shareScreen || entry.webBrowser || entry.camera) {
    const entryCompeted = completeEntry(entry,is360,parent.state.selectAction);
    parent.selectEntry(entryCompeted);
  } else if (!entry.lucky_query) {
    parent.selectEntry(entry);
  } else {
    // Entry has a pointer to another "i'm feeling lucky" query -- used for trending videos
    //
    // Also, mark the browser to clear the stashed query on close, since this is a temporary
    // query we are running to get the result we want.
    parent.setState({ clearStashedQueryOnClose: true });
    parent.handleQueryUpdated(entry.lucky_query, true);
  }
};

export function createAvatarCustomTileV2(onclick) {
  return <CreateAvatar onAvatar={(evt,url) => {
    let entry = {
      "attributions": null,
      "description": null,
      "gltfs": {
        "avatar": url,
        "base": url
      },
      "id": url,
      "name": "Cedric",
      "type": "avatar",
      "url": url
    };

    onclick(evt, entry);
    console.log(evt,url);
  }} />;
}
