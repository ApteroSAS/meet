export const ERROR_LOG_NOTIFICATION = "ERROR_LOG_NOTIFICATION";
export const WARN_LOG_NOTIFICATION = "WARN_LOG_NOTIFICATION";
export const THROW_NOTIFICATION = "THROW_NOTIFICATION";

//window.postMessage(JSON.stringify({type:"THROW_NOTIFICATION", data:{}}), "*");
function sendIframeMessage(type, data) {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(JSON.stringify({ type, data }), "*");
  }
}

export function registerTeamsTestHelper() {
  //if we are in msTeams the app will always be in an iframe this file aims to help the CI in this case
  const oldWarn = console.warn;
  console.warn = (a, ...args) => {
    try {
      sendIframeMessage(WARN_LOG_NOTIFICATION, "console warn reporter");
    } catch (e) {
      /* ignore */
    }
    return oldWarn(a, args);
  };
  const oldError = console.error;
  console.error = (a, ...args) => {
    try {
      sendIframeMessage(ERROR_LOG_NOTIFICATION, "console error reporter");
    } catch (e) {
      /* ignore */
    }
    return oldError(a, args);
  };
  const oldOnerror = window.onerror;
  //https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
  window.onerror = (message, source, lineno, colno, error) => {
    try {
      sendIframeMessage(THROW_NOTIFICATION, "console error reporter");
    } catch (e) {
      /* ignore */
    }
    if (oldOnerror) {
      return oldOnerror(message, source, lineno, colno, error);
    }
  };
}
