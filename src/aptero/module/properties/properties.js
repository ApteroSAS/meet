window.APP_PROPS = {
  // To override these variables, create a .env file containing the overrides.

  // The Reticulum backend to connect to. Used for storing information about active hubs.
  // change this in default.conf also
  PROTOCOL: "https://",

  SHORTLINK_DOMAIN:"alphahub.aptero.co",

  RETICULUM_SERVER: "alphahub.aptero.co",

  //api for converting images into 360 scenes
  API_360_TO_SCENE:"https://api3.aptero.co/service/360toscene/api/",

  // CORS proxy.
  CORS_PROXY_SERVER: "corsproxy.aptero.co",

  // The thumbnailing backend to connect to.
  // See here for the server code: https://github.com/MozillaReality/farspark or https://github.com/MozillaReality/nearspark
  THUMBNAIL_SERVER: "",

  // Comma-separated list of domains which are known to not need CORS proxying
  NON_CORS_PROXY_DOMAINS: "aptero.co",

  // A comma-separated list of environment URLs to make available in the picker, besides the defaults.
  // These URLs are expected to be relative to ASSET_BUNDLE_SERVER.
  EXTRA_ENVIRONMENTS: "",

  // The root URL under which Hubs expects static assets to be served.
  BASE_ASSETS_PATH: "/",

  DEFAULT_SCENE_SID: "h8xwUAc",

  AVAILABLE_INTEGRATIONS:{"objects":true, "videos360":true, "videos2d":true, "scenes":true, "avatars":true,"tenor":false,"poly":false, "sketchfab":false,"bing_videos":false},

  REMOTE_VM_SERVICE:{ url:"vm.aptero.co"},
  WEBRTC_BRIDGE_URL:"http://localhost:8195",

  //SENTRY_DSN:"https://944afa0719c6473997fa1d6a06515c7e@o407192.ingest.sentry.io/5275835",
  //SENTRY_ENV:"web-local",

  "@aptero/axolotis-module-room":{
    ROOM_TOKEN_SERVICE: "https://alphahub.aptero.co"
  },
  "@aptero/axolotis-module-teams":{
    MICROSOFT_APP_ID: "c89c5d54-37ec-49d6-952a-befc9b770079",
    //MICROSOFT_APP_AUTHORITY: "https://login.microsoftonline.com/apteroco.onmicrosoft.com",
    MICROSOFT_APP_AUTHORITY:"https://login.microsoftonline.com/common",
  },
  "@aptero/axolotis-module-phoenix-auth":{
    RETICULUM_SERVER: "alphahub.aptero.co",
    RETICULUM_SOCKET_PROTOCOL: "",
    RETICULUM_SOCKET_SERVER: ""
  },

  APP_CONFIG: {
    GLOBAL_ASSETS_PATH: "https://meet.aptero.co/data/global/",
    LOGGER:{
      URL:"https://aptero.co/tracking",
      ACTIVATED:false,
      ORIGIN:"meet-frontend-localhost"
    },
    adapterParams: {
      adapter: "twilio",//dialog,dialog-io,janus,twilio,agora,default,none,socketio
      transport:"WebSocketTransport"
    },
    features: {
      teams_limited:false,//for publication we limit bugged feature
      fast_room_switching:true,
      hide_powered_by: true,
      show_feedback_ui: false,
      disable_room_creation: true,
      staticObjectManipulator: true //warning bug if set to false
    },
    links:{
      privacy_notice:"https://aptero.co/privacy.html",
      terms_of_use:"https://aptero.co/terms.html",
    },
   
    theme:
      {
      "dark-theme": false,
      "action-color":"#F59C26",
      "action-color-highlight":"#F59C26",
      "action-text-color":"#F59C26",
      "action-subtitle-color":"#F59C26",
      "action-label-color":"#F59C26",
      "notice-background-color":"#F59C26",
      "notice-text-color":"#F59C26",
      "notice-widget-color":"#F59C26",
      "favorited-color":"#F59C26",
      themes:
          [
            {
              "id": "light-default",
              "default": true,
              "name": "Default Light Mode",
              "variables": {
                "dark-theme": false,
                "apt-bleu": "#172540",
                "apt-bleu-1": "#183260",
                "apt-bleu-2": "#1b4186",
                "apt-rouge": "#f05e46",
                "apt-rouge-1": "#de4f3f",
                "apt-rouge-2": "#f57769",
                "apt-jaune": "#f59c26",
                "apt-jaune-1": "#d8800d",
                "apt-jaune-2": "#fab030",
                "apt-gris": "#eff4fa",
                "apt-bleu-fonce": "#131b2f",
                "action-color":"#F59C26",
                "action-color-highlight":"#F59C26",
                "action-text-color":"#F59C26",
                "action-subtitle-color":"#F59C26",
                "action-label-color":"#F59C26",
                "notice-background-color":"#F59C26",
                "notice-text-color":"#F59C26",
                "notice-widget-color":"#F59C26",
                "favorited-color":"#F59C26",
                "primary-color": "var(--apt-jaune)",
                "primary-color-hover": "var(--apt-jaune-1)",
                "primary-color-pressed": "var(--apt-jaune-2)",
                "secondary-color": "var(--apt-rouge)",
                "secondary-color-hover": "var(--apt-rouge-1)",
                "secondary-color-pressed": "var(--apt-rouge-2)",
                "accent1-color": "var(--apt-rouge)",
                "accent1-color-hover": "var(--apt-rouge-1)",
                "accent1-color-pressed": "var(--apt-rouge-2)",
                "accent2-color": "var(--apt-jaune)",
                "accent2-color-hover": "var(--apt-jaune-1)",
                "accent2-color-pressed": "var(--apt-jaune-2)",
                "accent3-color": "var(--apt-bleu-2)",
                "accent3-color-hover": "var(--apt-bleu-1)",
                "accent3-color-pressed": "var(--apt-bleu)",
                "accent4-color": "var(--apt-jaune)",
                "accent4-color-hover": "var(--apt-jaune-1)",
                "accent4-color-pressed": "var(--apt-jaune-2)",
                "accent5-color": "var(--apt-rouge)",
                "accent5-color-hover": "var(--apt-rouge-1)",
                "accent5-color-pressed": "var(--apt-rouge-2)",
                "link-color": "var(--apt-bleu-2)",
                "link-color-hover": "var(--apt-bleu-1)",
                "link-color-pressed": "var(--apt-bleu)",
              }
            },{
            "id": "dark-default",
            "darkModeDefault": true,
            "name": "Default Dark Mode",
            "variables": {
              "text1-color": "#ffffff",
              "text1-color-hover": "#E7E7E7",
              "text1-color-pressed": "#DBDBDB",
              "text2-color": "#E7E7E7",
              "text2-color-hover": "#F5F5F5",
              "text2-color-pressed": "#DBDBDB",
              "text3-color": "#BBBBBB",
              "text3-color-hover": "#C7C7C7",
              "text3-color-pressed": "#ADADAD",
              "text4-color": "#E7E7E7",
              "basic-color": "#3A4048",
              "basic-color-hover": "#4B5562",
              "basic-color-pressed": "#636F80",
              "basic-border-color": "#5D646C",
              "secondary-color": "#3A4048",
              "secondary-color-hover": "#5D646C",
              "secondary-color-pressed": "#282C31",
              "background1-color": "#15171B",
              "background2-color": "#282C31",
              "background3-color": "#3A4048",
              "background4-color": "#5D646C",
              "loading-screen-background": "radial-gradient(50% 50% at 50% 50%, #15171B 0%, #282C31 100%)",
              "border1-color": "#3A4048",
              "border2-color": "#5D646C",
              "border3-color": "#5D646C",
              "outline-color": "#ffffff",
              "action-color": "#ff3464",
              "action-color-highlight": "#ff74a4",
              "background-hover-color": "#aaaaaa",
              "notice-background-color": "#2f80ed"
            }
          }
            ],
    }
  }

};

window.getPreferences = function(key) {
  return (window.APP.override && window.APP.override.preferences[key]) || window.APP.store.state.preferences[key];
};
