export const properties = {
  // To override these variables, create a .env file containing the overrides.

  // The Reticulum backend to connect to. Used for storing information about active hubs.
  // change this in default.conf also
  RETICULUM_SERVER: "dev.reticulum.io",

  // CORS proxy.
  //CORS_PROXY_SERVER="hub.aptero.co"
  CORS_PROXY_SERVER: "cors-proxy-dev.reticulum.io",

  // The thumbnailing backend to connect to.
  // See here for the server code: https://github.com/MozillaReality/farspark or https://github.com/MozillaReality/nearspark
  THUMBNAIL_SERVER: "nearspark-dev.reticulum.io",

  // Comma-separated list of domains which are known to not need CORS proxying
  NON_CORS_PROXY_DOMAINS: "hubs.local,dev.reticulum.io",

  // A comma-separated list of environment URLs to make available in the picker, besides the defaults.
  // These URLs are expected to be relative to ASSET_BUNDLE_SERVER.
  EXTRA_ENVIRONMENTS: "",

  // The root URL under which Hubs expects static assets to be served.
  BASE_ASSETS_PATH: "/",

  DEFAULT_SCENE_SID: "JGLt8DP",

  APP_CONFIG: {
    features: {
      hide_powered_by: true
    }
  }

};

export function registerProperties() {
  /*if(!process) {
    process = {};
  }*/
  if (!process.env) {
    process.env = {};
  }
  process.env = { ...properties, ...process.env };
}
