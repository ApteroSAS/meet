export async function waitInitialSceneLoad(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      window.document.addEventListener("apt:room:entered", resolve);
    });
  });
  //await waitPageLoadedAll(page);
  await page.bringToFront();//important for microphone authorization
  await new Promise(resolve => setTimeout(resolve, 5000));//TODO find a better event
}

export function treatConsoleWarnAsError(page) {
  page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      // @ts-ignore
      window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve) : window.onCancelPlayWrightEvaluate = [resolve];
      const oldWarn = console.warn;
      console.warn = (a, ...args) => {
        oldWarn(args);
        reject("playwright console warn reporter " + a + " " + JSON.stringify(args));
      };
    });
  }).catch(async e => {
    if (process.env.PWDEBUG) {
      await page.pause();
    }
    throw new Error(e);
  });
}

export function treatConsoleErrorAsError(page) {
  page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      // @ts-ignore
      window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve) : window.onCancelPlayWrightEvaluate = [resolve];
      const oldError = console.error;
      console.error = (a, ...args) => {
        oldError(a, ...args);
        reject("playwright console error reporter " + a + " " + JSON.stringify(args));
      };
    });
  }).catch(async e => {
    if (process.env.PWDEBUG) {
      await page.pause();
    }
    throw new Error(e);
  });
}

export function failsTheTestOnUnhandledError(page) {
  page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      // @ts-ignore
      window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve) : window.onCancelPlayWrightEvaluate = [resolve];
      const oldOnerror = window.onerror;
      window.onerror = (...args) => {
        reject("playwright error reporter " + JSON.stringify(args));
        return oldOnerror(...args);
      };
    });
  }).catch(async e => {
    if (process.env.PWDEBUG) {
      await page.pause();
    }
    throw new Error(e);
  });
}

export function failsTheTestOnUnhandledErrorInPromise(page) {
  page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      // @ts-ignore
      window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve) : window.onCancelPlayWrightEvaluate = [resolve];
      const oldOnerror = window.onerror;
      window.onerror = (...args) => {
        reject("playwright error reporter " + JSON.stringify(args));
        return oldOnerror(...args);
      };
      window.addEventListener("unhandledrejection", function(promiseRejectionEvent) {
        reject("playwright unhandledrejection in promise reporter " + JSON.stringify(promiseRejectionEvent));
      });
    });
  }).catch(async e => {
    if (process.env.PWDEBUG) {
      await page.pause();
    }
    throw new Error(e);
  });
}

export function startErrorWatch(page) {
  failsTheTestOnUnhandledErrorInPromise(page);
  failsTheTestOnUnhandledError(page);
  treatConsoleErrorAsError(page);
}

export async function stopErrorWatch(page) {
  await page.evaluate(async () => {
    // @ts-ignore
    for (const cancel of window.onCancelPlayWrightEvaluate) {
      cancel();
    }
  });
  if (process.env.PWDEBUG) {
    await page.pause();
  }
}