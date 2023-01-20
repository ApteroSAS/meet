import { SOUND_PIN } from "../../../systems/sound-effects-system";
import { choseAdapter, getAdapterParams } from "../webRTCadapter/adapter-config";
import { AdapterWrapper } from "../webRTCadapter/AdapterWrapper";
import { wait } from "../../util/AsyncWaiter";

const history = [];
let currentSubroomId = null;
let currentSubAdapter = null;
let defaultAdapter = null;

export async function switchAdapter(adapter) {
  if (!currentSubAdapter) {
    //first current adapter init
    currentSubAdapter = defaultAdapter;
  }
  if (adapter !== currentSubAdapter) {
    currentSubAdapter = adapter;
    await APP.dialog.disconnect();
    await choseAdapter(adapter);
    APP.dialog = new AdapterWrapper();
    await wait(() => {
      return APP.dialog.lasyLoadingFinished;
    });
  }
}

async function getOwnerId(el) {
  const networkedEl = await NAF.utils.getNetworkedEntity(el).catch(e => {
    console.error(e);
  });
  if (!networkedEl) {
    return null;
  }
  return networkedEl.components.networked.data.owner;
}

export async function changeAudioSubRoom(subroomid) {
  if (currentSubroomId === subroomid) {
    return;
  }
  if (!defaultAdapter) {
    //first adapter we see is the default
    defaultAdapter = getAdapterParams().adapter;
  }
  currentSubroomId = subroomid;
  const oldParams = {
    roomId: APP.dialog._roomId,
    serverUrl: APP.dialog._serverUrl,
    serverParams: APP.dialog._serverParams,
    clientId: APP.dialog._clientId,
    forceTcp: APP.dialog._forceTcp,
    forceTurn: APP.dialog._forceTurn,
    iceTransportPolicy: APP.dialog._iceTransportPolicy
  };
  await APP.dialog.disconnect();

  const splitStr = subroomid.split(":");
  let adapter = defaultAdapter;
  if (splitStr.length === 2) {
    adapter = splitStr[0];
    await switchAdapter(adapter);
    subroomid = splitStr[1];
  } else {
    //no adapter specified in the params so we use default one
    await switchAdapter(adapter);
  }

  let newRoomId;
  if (subroomid && subroomid === "default") {
    newRoomId = APP.hub.hub_id;
  } else {
    newRoomId = APP.hub.hub_id + "-" + subroomid;
  }
  console.log(newRoomId);

  const data = await window.APP.hubChannel.fetchPermissions();
  const scene = AFRAME.scenes[0];
  APP.dialog.adapterUserListener.onUserEnter(async peerid => {
    for (const avatar of scene.querySelectorAll("[avatar-audio-source]")) {
      const aos = avatar.components["avatar-audio-source"];
      const peeridAvatar = await getOwnerId(aos.el);
      if (peeridAvatar === peerid) {
        console.log("audio created ", peerid);
        avatar.components["avatar-audio-source"].destroyAudio();
        avatar.components["avatar-audio-source"].createAudio();
      }
    }
  });
  APP.dialog.adapterUserListener.onUserLeave(async peerid => {
    for (const avatar of scene.querySelectorAll("[avatar-audio-source]")) {
      const aos = avatar.components["avatar-audio-source"];
      const peeridAvatar = await getOwnerId(aos.el);
      if (peeridAvatar === peerid) {
        console.log("audio destroyed ", peerid);
        avatar.components["avatar-audio-source"].destroyAudio();
      }
    }
  });
  await APP.dialog.connect({
    serverUrl: oldParams.serverUrl,
    roomId: newRoomId,
    joinToken: data.permsToken,
    serverParams: oldParams.serverParams,
    scene,
    clientId: oldParams.clientId,
    forceTcp: oldParams.forceTcp,
    forceTurn: oldParams.forceTurn,
    iceTransportPolicy: oldParams.iceTransportPolicy
  });

  await window.APP.mediaDevicesManager.stopMicShare();

  if (adapter !== "none") {
    await window.APP.mediaDevicesManager.startMicShare(window.APP.store.state.settings.lastUsedMicDeviceId);
    APP.dialog.enableMicrophone(true);
  }

  /** 1) I enter/exit a new sub room
   *        destroy audio for anyone
   *        create audio for people in da subroom
   *  2) a user enter a subroom
   *        destroy create his audio
   *  3) a user leave a sub room
   *        destroy his audio
   *
   * Step 1 list people in the room
   * Step 2 generate event
   * Step 3 put algo
   * Step 4 test
   *        **/

  //I enter/exit a new sub room
  scene.querySelectorAll("[avatar-audio-source]").forEach(avatar => {
    avatar.components["avatar-audio-source"].destroyAudio();
    avatar.components["avatar-audio-source"].createAudio();
  });

  scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_PIN);
  APP.messageDispatch.receive({
    type: "audio_sub_room_changed",
    subroom: subroomid + " (" + adapter + ")",
    showLineBreak: true
  });
  window.audioChangeHelperController.spawn();
}

export async function pushAudioSubRoom(subroomid) {
  history.push(subroomid);
  await changeAudioSubRoom(subroomid);
}

export async function popAudioSubRoom() {
  history.pop();
  await changeAudioSubRoom(history.length === 0 ? "default" : history[history.length - 1]);
}
