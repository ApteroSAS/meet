import Raven from "raven-js";
import configs from "./utils/configs";

const ga = window.ga;

export default function registerTelemetry(trackedPage, trackedTitle) {
  const sentryDsn = configs.SENTRY_DSN;
  const gaTrackingId = configs.GA_TRACKING_ID;

  if (sentryDsn) {
    console.log("Tracking: Sentry DSN: " + sentryDsn);
    //Aptero patch
    Raven.config(sentryDsn,{
      environment:configs.SENTRY_ENV || "web_default",
      release: process.env.BUILD_VERSION
    }).install();
  }

  if (ga && gaTrackingId) {
    console.log("Tracking: Google Analytics ID: " + gaTrackingId);

    ga("create", gaTrackingId, "auto");

    if (trackedPage) {
      ga("set", "page", trackedPage);
    }

    if (trackedTitle) {
      ga("set", "title", trackedTitle);
    }

    ga("send", "pageview");
  }
}
