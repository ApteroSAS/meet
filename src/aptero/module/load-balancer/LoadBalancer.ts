import { networkService } from "../HubsBridge/service/NetworkService";

declare const window: Window | any;
const roomUrl = window.location.href; //initial room url

export interface Instances {
  roomSID: string;
  clones: {
    [id: string]: {
      url: string;
      name: string;
      people: number;
      peopleMax: number;
      main?: boolean;
      current: boolean;
    };
  };
}

let instances: Instances;

const EVENT = "room-updated";

export async function redirectIfNeeded() {
  try {
    //initial fetch load balancer meta data in a non blocking way
    if (window.location.host !== "localhost") {
      //at this point the body corespond to the right room we just need to update the url to be coherent with the body
      let roomUrl = new URL((document.querySelector('[property~="og:url"][content]') as any).content);
      let windowUrl = new URL(window.location);
      if (roomUrl.pathname !== windowUrl.pathname) {
        roomUrl.search = windowUrl.search; //the search param does not apear in the og:url
        window.history.pushState(null, null, roomUrl);
      }
    }

    //loadbalancer clones data
    getClones();
    networkService.onMessage(EVENT, () => {
      console.log("room update received");
      //fetch meta data in a non blocking way
      getClones();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function redirectIfNeededV1() {
  try {
    const url = new URL(roomUrl);
    let offline = url.searchParams.get("offline2");
    if (offline === "true") {
      return;
    }
    const host = window.APP_PROPS.RETICULUM_SERVER;
    let response = await fetch(
      window.location.protocol + "//" + host + "/service/loadbalancer/redirect?url=" + encodeURIComponent(roomUrl)
    );
    let data: { url: string } = await response.json();
    networkService.onMessage(EVENT, () => {
      console.log("room update recived");
      //fetch meta data in a non blocking way
      getClones();
    });
    if (!data.url) {
      console.error("invalid return data");
      return;
    }
    if (roomUrl !== data.url) {
      //window.location.replace(data.url);
      window.location.href = data.url;
      console.log("redirect to :" + roomUrl);
    }
    //initial fetch meta data in a non blocking way
    getClones();
  } catch (e) {
    console.error(e);
  }
}

export async function getData(): Promise<Instances> {
  const host = window.APP_PROPS.RETICULUM_SERVER;
  const response = await fetch(
    window.location.protocol +
      "//" +
      host +
      "/service/loadbalancer/meta?url=" +
      encodeURIComponent(window.location.href)
  );
  let data = await response.json();
  if (!data.clones) {
    throw new Error();
  }
  return data;
}

export interface ClonesI {
  [id: string]: {
    name: string;
    url: string;
    people: number;
    peopleMax: number;
    current: boolean;
  };
}

export async function getClones(): Promise<{
  roomSID: string;
  clones: ClonesI;
}> {
  instances = await getData();
  return instances;
}

export function hasInstances(): boolean {
  if (!instances) return false;
  return Object.keys(instances.clones).length > 1;
}
