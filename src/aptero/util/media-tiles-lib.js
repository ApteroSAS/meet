import styles from "../../assets/stylesheets/media-browser.scss";
import classNames from "classnames";
import React from "react";

export class MediaTilesLib {

  setPropsAndState(parent, props, state) {
    this.parent = parent;
    this.props = props;
    this.state = state;
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
      this.props.handleEntryClicked && this.props.handleEntryClicked(e, { createLiveEntry: true });
    };
    const [imageWidth, imageHeight] = this.getTileDimensions(false, false, 16 / 9);
    return (<div style={{ width: `${imageWidth}px` }} className={styles.tile} key={`create-live`}>
      <a rel="noreferrer noopener"
         onClick={clickAction}
         className={styles.tileLink}
         style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
      ><img
        className={classNames(styles.tileContent, styles.avatarTile)}
        style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        src={"../../assets/static/app-thumbnail.png"}
      />
      </a>
      <div className={styles.info}>
        <a
          rel="noreferrer noopener"
          className={styles.name}
          style={{ textAlign: "center" }}
          onClick={clickAction}
        >
          {"Create à new live stream" || "\u00A0"}
        </a>
      </div>
    </div>);
  }

  createShareScreenTile() {
    const clickAction = (e) => {
      this.props.handleEntryClicked && this.props.handleEntryClicked(e, { shareScreen: {} });
    };
    const [imageWidth, imageHeight] = this.getTileDimensions(false, false, 16 / 9);
    return (<div style={{ width: `${imageWidth}px` }} className={styles.tile} key={`share-screen`}>
      <a rel="noreferrer noopener"
         onClick={clickAction}
         className={styles.tileLink}
         style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
      ><img
        className={classNames(styles.tileContent, styles.avatarTile)}
        style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        src={"../../assets/static/share-screen.png"}
      />
      </a>
      <div className={styles.info}>
        <a
          rel="noreferrer noopener"
          className={styles.name}
          style={{ textAlign: "center" }}
          onClick={clickAction}
        >
          {"Share your screen" || "\u00A0"}
        </a>
      </div>
    </div>);
  }

  createWebcamTile(device) {
    const clickAction = (e) => {
      this.props.handleEntryClicked && this.props.handleEntryClicked(e, { camera: device });
    };
    const [imageWidth, imageHeight] = this.getTileDimensions(false, false, 16 / 9);
    return (<div style={{ width: `${imageWidth}px` }} className={styles.tile} key={`camera-live` + device.deviceId}>
      <a rel="noreferrer noopener"
         onClick={clickAction}
         className={styles.tileLink}
         style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
      ><img
        className={classNames(styles.tileContent, styles.avatarTile)}
        style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        src={"../../assets/static/camera-thumbnail.png"}
      />
      </a>
      <div className={styles.info}>
        <a
          rel="noreferrer noopener"
          className={styles.name}
          style={{ textAlign: "center" }}
          onClick={clickAction}
        >
          {device.label || "\u00A0"}
        </a>
      </div>
    </div>);
  }


  createWebcamTiles() {
    //1 try to update the camera list
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      let camlist = {};
      devices.forEach((device) => {
        //console.log(device.kind + ": " + device.label +" id = " + device.deviceId);
        if (device.kind === "videoinput") {
          camlist[device.deviceId] = device;
        }
      });
      if (Object.keys(this.state.webcamlist).length !== Object.keys(camlist).length) {
        this.parent.setState({ webcamlist: camlist });
      }
    }).catch((err) => {
      console.log(err.name + ": " + err.message);
    });

    return Object.keys(this.state.webcamlist).map(key => {
      return this.createWebcamTile(this.state.webcamlist[key]);
    });
  }

  createAdditionalTiles() {
    return <React.Fragment>
      {(this.props.history && this.props.history.location.search.search("live") !== -1) && this.createWebcamTiles()}
      {(this.props.history && this.props.history.location.search.search("live") !== -1 && this.props.history.location.search.search("360") === -1) && this.createShareScreenTile()}
    </React.Fragment>;
  }

}
