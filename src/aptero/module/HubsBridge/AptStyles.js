import React, { Component } from "react";
import "./AptStyles.scss"
//We grab the style selectors of the elements we want to change
import stylesToolbar from "../../../react-components/layout/Toolbar.scss";
import styleRoomLayout from "../../../react-components/layout/RoomLayout.scss";
import stylesRoomEntryModal from "../../../react-components/room/RoomEntryModal.scss";
import stylesContentMenu from "../../../react-components/room/ContentMenu.scss";
import stylesUtils from "../../../react-components/styles/style-utils.scss";
import stylesToolbarButton from "../../../react-components/input/ToolbarButton.scss";
import stylesModal from "../../../react-components/modal/Modal.scss";
import stylesEnterOnDeviceModal from "../../../react-components/room/EnterOnDeviceModal.scss";
import stylesLoadingSpinner from "../../../react-components/misc/Spinner.scss";
import stylesLoadingScreenLayout from "../../../react-components/layout/LoadingScreenLayout.scss"
import anim_bg_svg from "../../../assets/aptero/loadingPage/anim_bg.svg"
import gif_tuto_svg from "../../../assets/aptero/loadingPage/gif_tuto.gif"
import logo_svg from "../../../assets/aptero/loadingPage/logo.svg"

const inviteSelector = `.ApteroStyles .${stylesUtils.showLg}.${stylesToolbar.content}:first-child > *:first-child`; //Also present before loading
const leaveSelector = ".ApteroStyles.entered " + `.${stylesUtils.showLg}.${stylesToolbar.content}:last-child > *:first-child`;
const moreSelector = `.ApteroStyles .${stylesUtils.showLg}.${stylesToolbar.content}:last-child > *:nth-last-child(2)`; //Also present before loading
const voiceSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:first-child`;
const shareSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:nth-child(2)`;
const placeSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:nth-child(3)`;
const reactSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:nth-child(4)`;
const chatSelector = `.ApteroStyles .${stylesToolbar.content}:nth-child(2) > *:last-child`; //Also present before loading
const peopleSelector = `.ApteroStyles .${stylesContentMenu.contentMenuButton}:last-child`; //Also present before loading
const objectSelector = `.ApteroStyles.entered .${stylesContentMenu.contentMenuButton}:first-child`;
const headsetSelector = `.ApteroStyles .${stylesRoomEntryModal.buttons} > :nth-child(2)`;

const oldSpinnerSVG = `.${stylesLoadingSpinner.spinner}`;
const loadingScreenParent = `.${stylesLoadingScreenLayout.loadingScreenLayout}`
const loadingScreenLogo = `.${stylesLoadingScreenLayout.logo}`
const loadingScreenBottom = `.${stylesLoadingScreenLayout.bottom}`
const loadingScreenCenter = `.${stylesLoadingScreenLayout.center}`
const anim_bg_url = new URL(anim_bg_svg, window.location).href;
const gif_tuto_url = new URL(gif_tuto_svg, window.location).href;
const logo_url = new URL(logo_svg, window.location).href;

const apt_bleu = "#172540";
const apt_bleu_1 = "#183260";
const apt_bleu_2 = "#1b4186";
const apt_rouge = "#f05e46";
const apt_rouge_1 = "#de4f3f";
const apt_rouge_2 = "#f57769";
const apt_jaune = "#f59c26";
const apt_jaune_1 = "#d8800d";
const apt_jaune_2 = "#fab030";
const apt_gris = "#eff4fa";
const apt_bleu_fonce = "#131b2f";

export default class AptStyle extends Component {
  constructor(props) {
    super(props);
    this.setUp = this.setUp.bind(this);
  }

  setUp() {
    const scene = AFRAME.scenes[0];
    //console.log(stylesEnterOnDeviceModal);
    //We apply styling priority by adding a selector class
    document.body.classList.add("ApteroStyles");

    const logo = document.querySelector(loadingScreenLogo)
    logo.src = logo_url;

    //We apply class to inform the styles about the state of the room
    scene.addEventListener("entered", () => {
      document.body.classList.add("entered");
    });
  }

  componentDidMount() {
    const scene = AFRAME.scenes[0];
    if (scene) this.setUp();
    else {
      const sceneEl = document.querySelector("a-scene"); //renderstart
      sceneEl.addEventListener("renderstart", this.setUp);
    }
  }

  render() {
    return (
        <>
          <style>

            .ApteroStyles {oldSpinnerSVG}
            {`{
            animation:none;
            background-image: url(${gif_tuto_url});
            background-size: contain;
            width: 300px;
            max-width: 90%;
            height: auto;
            margin-top: -100px;
          }`}

            .ApteroStyles {oldSpinnerSVG} path
            {`{
            display:none
          }`}

            .ApteroStyles {loadingScreenParent}
            {`{
              background-color:white;
              background-image: url(${anim_bg_url});
              background-position: center;
              background-repeat: no-repeat;
              background-size: cover;
              
          }`}

            .ApteroStyles {loadingScreenBottom}
            {`{
          
          }`}

            .ApteroStyles {loadingScreenCenter}
            {`{
              display: grid;
              grid-template-rows : 8fr 1fr;
              grid-template-areas :
                "middle"
                "bottom";
              width: 100%;
              height: 100%;
          }`}

            .ApteroStyles {loadingScreenCenter} *:not(img)
            {`{
              grid-area:middle;
              justify-self:center;
          }`}

            .ApteroStyles {loadingScreenCenter} p
            {`{
              position: relative;
              width: 500px;
              max-width: 85vw;
              height:38px;
              margin-top: 30px;
              padding: 10px 20px;
              border-radius: 4px;
              box-sizing: border-box;
              background: #fff;
              box-shadow: 0 10px 20px rgb(0 0 0 / 50%);
              animation: pulse 5s infinite;
              top: 7rem;
              line-height: 6em;
              font-size: 1.2em;
          }`}

            .ApteroStyles {loadingScreenCenter} p::before
            {`{
              content:" ";
              position:absolute;
              left: 20px;
              top:14px;
              width: calc(100% - 40px);
              height: 10px;
              background: #f1f1f1;
              box-shadow: inset 0 0 5px rgba(0, 0, 0, .2);
              border-radius: 4px;
              overflow: hidden;
              color: grey;
          }`}

            .ApteroStyles {loadingScreenCenter} p::after
            {`{
              content: '';
              position: absolute;
              left: 20px;
              top:14px;
              width: 0;
              height: 10px;
              border-radius: 4px;
              box-shadow: 0 0 5px rgba(0, 0, 0, .2);
              background:white;
              animation: load 5s infinite;
          }`}

            {`
          @keyframes load {
            0% {
              width: 0;
            }
              25% {
              width: calc(40% - 40px);
            }
              50% {
              width: calc(60% - 40px);
            }
              75% {
              width: calc(75% - 40px);
            }
              100% {
              width: calc(100% - 40px);
            }
          }

          @keyframes pulse {
            0% {
              background: #F59C26 ;
            }

            25% {
              background: #EB5E47;
            }
    
            50% {
              background: #173663;
            }
    
            75% {
              background: #EB5E47;
            }
    
            100% {
              background: #F59C26;
            }
        }`}

            .ApteroStyles {loadingScreenLogo}
            {`{
              width: 200px;
              max-width: 90%;
              grid-area:bottom;
              position:relative;
              justify-self:center;
              transform:none;
              margin: 0;
              align-self: end;
          }`}

            .ApteroStyles .{stylesEnterOnDeviceModal.shortUrlContainer}
            {`{
            width: max-content;
            padding: 1em 0.3em;
          }`}
            .ApteroStyles .{stylesToolbar.toolbar}
            {`{
            background-color : transparent;
            border : none;
            grid-column-end: auto;
            height: min-content;
            padding: 12px;
            position: relative;
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons}
            {`{
                flex-direction: row;
                width: 100%;
                justify-content: space-around;
                flex-wrap: wrap;
                
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons} button:nth-child(-n+3)
            {`{
            background-color: transparent;
            color: black;
            display: flex;
            flex-direction: column;
            margin: 0;
            padding: 0;
            height: 4.9em;
            justify-content: space-between;
            width: calc(100%/3);
            min-width: 0px;
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons} button:nth-child(-n+3) span
            {`{
            margin-top: 0.5em;
            max-width: 100%;
            white-space: break-spaces;
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons} button:nth-child(-n+3) svg
            {`{
            background-color: var(--accent1-color);
            border-color: var(--accent1-color);
            transition: background-color 0.1s ease-in-out, border-color 0.1s ease-in-out;
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons} button:nth-child(-n+3):hover svg
            {`{
            background-color: var(--accent1-color-hover);
            border-color: var(--accent1-color-hover);
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons} button:nth-child(-n+3):active svg {`{
            background-color: var(--accent1-color-pressed);
            border-color: var(--accent1-color-pressed);
          }`}
            .ApteroStyles .{stylesRoomEntryModal.buttons} button svg
            {`{
            width: 40px;
            height: 40px;
            padding: 7px;
            border-radius: 50px;
            margin:0;
          }`}
            .ApteroStyles .{stylesModal.content}
            {`{
            max-height: calc(100vh - 170px);
            overflow-y: auto; 
          }`}
            .ApteroStyles .{styleRoomLayout.roomLayout}
            {`{
            display:grid;
            grid-template-columns: [main] auto [iconspace] minmax(0, min-content) [sidebar] minmax(0, min-content)
          }`}
            .ApteroStyles .{styleRoomLayout.sidebar}
            {`{
            grid-row-start: 1;
            grid-row-end: 3;
          }`}
            .ApteroStyles .{stylesToolbar.content}:first-of-type {">"} *
            {`{
            width:48px
          }`}
            .ApteroStyles .{stylesToolbar.content} {">"} *:last-child
            {`{
            margin-right:0;
          }`}
            .ApteroStyles .{stylesToolbarButton.toolbarButton} label
            {`{
            display: none;
          }`}
            .ApteroStyles .{stylesContentMenu.contentMenu}
            {`{
              background: transparent;
              border: 0;
              top: 8px;
              right: 8px;
          }`}
            .ApteroStyles .{stylesContentMenu.active} svg *[stroke=\#000]
            {`{
              stroke: var(--text1-color);
          }`}
            .ApteroStyles .{stylesContentMenu.separator}
            {`{
            display:none;
          }`}
            .ApteroStyles .{stylesContentMenu.contentMenuButton}
            {`{
            border-radius: 100px;
            margin: 1em;
            padding: 0;
            position: relative;
          }`}
            .ApteroStyles .{stylesContentMenu.contentMenuButton} span
            {`{
            display:none;
          }`}
            .ApteroStyles .{stylesContentMenu.contentMenuButton}:last-child:after
            {`{
            content: attr(presencecount);
            top: -4px;
            position: absolute;
            font-size: 1.1em;
            right: -4px;
            background: white;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            border: solid 1px darkgrey;
            color: black;
          }`}
            .ApteroStyles .{stylesContentMenu.contentMenuButton} svg
            {`{
              border:transparent 2px solid;
              border-radius:9999px;
              width:41px;
              height:41px;
              padding:5px;
              margin:0;
          }`}
            .ApteroStyles .{stylesToolbarButton.selected} .{stylesToolbarButton.iconContainer}
            {`{
            background-color: white;
          }`}
            {moreSelector} div, {voiceSelector} {`>`} div, {inviteSelector} div,  .ApteroStyles .{stylesContentMenu.contentMenuButton}
            {`{
            border-color: var(--basic-color);
            background-color: var(--basic-color);
            border: solid 1px grey;
          }`}
            {moreSelector}:hover div, {voiceSelector}:hover {`>`} div, {inviteSelector}:hover div,  .ApteroStyles .{stylesContentMenu.contentMenuButton}:hover
            {`{
            border-color: var(--basic-color-hover);
            background-color: var(--basic-color-hover);
          }`}
            {moreSelector}:active div, {voiceSelector}:active {`>`} div, {inviteSelector}:active div,  .ApteroStyles .{stylesContentMenu.contentMenuButton}:active
            {`{
            border-color: var(--basic-color-pressed);
            background-color: var(--basic-color-pressed);
          }`}
            {moreSelector}
            {`{
            margin-right:0;
          }`}
            {headsetSelector}
            {`{
            display:none;
          }`}


          </style>
        </>
    );
  }
}
