import { Validator } from "jsonschema";
import merge from "deepmerge";

const LOCAL_STORE_KEY = "___hubs_store";
const STORE_STATE_CACHE_KEY = Symbol();
const validator = new Validator();
import { EventTarget } from "event-target-shim";
import { IService } from "@aptero/axolotis-player";

//TODO SCHEMA add function to update schema by component
export const SCHEMA = {
  id: "/HubsStore",

  definitions: {
    profile: {
      type: "object",
      additionalProperties: false,
      properties: {
        displayName: { type: "string", pattern: "^[A-Za-z0-9_~ -]{3,32}$" },
        avatarId: { type: "string" },
        //aptero
        companyName: { type: "string" },
        jobTitleName: { type: "string" },
        phoneNumber: { type: "string" },
        description: { type: "string" },
        profilePicture: { type: "string" },
        microsoftUserprofilePicture: { type: "string" },
        microsoftUser: { type: "string" },
        // personalAvatarId is obsolete, but we need it here for backwards compatibility.
        personalAvatarId: { type: "string" },
      },
    },

    credentials: {
      type: "object",
      additionalProperties: false,
      properties: {
        token: { type: ["null", "string"] },
        email: { type: ["null", "string"] },
      },
    },

    activity: {
      type: "object",
      additionalProperties: false,
      properties: {
        hasFoundFreeze: { type: "boolean" },
        hasChangedName: { type: "boolean" },
        hasAcceptedProfile: { type: "boolean" },
        hasChangedPicture: { type: "boolean" },
        hasChangedAvatar: { type: "boolean" },
        lastEnteredAt: { type: "string" },
        hasPinned: { type: "boolean" },
        hasRotated: { type: "boolean" },
        hasRecentered: { type: "boolean" },
        hasScaled: { type: "boolean" },
        hasHoveredInWorldHud: { type: "boolean" },
        hasOpenedShare: { type: "boolean" },
        entryCount: { type: "number" },
      },
    },

    settings: {
      type: "object",
      additionalProperties: false,
      properties: {
        lastUsedMicDeviceId: { type: "string" },
        micMuted: { type: "bool" },
      },
    },

    preferences: {
      type: "object",
      // Allow removed preferences to pass validation
      additionalProperties: true,
      properties: {
        shouldPromptForRefresh: { type: "bool" },
        preferredMic: { type: "string" },
        preferredCamera: { type: "string" },
        muteMicOnEntry: { type: "bool" },
        audioOutputMode: { type: "string" },
        audioNormalization: { type: "bool" },
        invertTouchscreenCameraMove: { type: "bool" },
        enableOnScreenJoystickLeft: { type: "bool" },
        enableOnScreenJoystickRight: { type: "bool" },
        enableGyro: { type: "bool" },
        onlyShowNametagsInFreeze: { type: "bool" },
        animateWaypointTransitions: { type: "bool" },
        showFPSCounter: { type: "bool" },
        allowMultipleHubsInstances: { type: "bool" },
        disableIdleDetection: { type: "bool" },
        fastRoomSwitching: { type: "bool" },
        preferMobileObjectInfoPanel: { type: "bool" },
        maxResolutionWidth: { type: "number" },
        maxResolutionHeight: { type: "number" },
        globalVoiceVolume: { type: "number" },
        globalMediaVolume: { type: "number" },
        snapRotationDegrees: { type: "number" },
        materialQualitySetting: { type: "string" },
        enableDynamicShadows: { type: "bool" },
        disableSoundEffects: { type: "bool" },
        disableMovement: { type: "bool" },
        disableBackwardsMovement: { type: "bool" },
        disableStrafing: { type: "bool" },
        disableTeleporter: { type: "bool" },
        disableAutoPixelRatio: { type: "bool" },
        movementSpeedModifier: { type: "number" },
        disableEchoCancellation: { type: "bool" },
        disableNoiseSuppression: { type: "bool" },
        disableAutoGainControl: { type: "bool" },
        locale: { type: "string" },
        showRtcDebugPanel: { type: "bool" },
        showAudioDebugPanel: { type: "bool" },
        enableAudioClipping: { type: "bool" },
        audioClippingThreshold: { type: "number" },
        theme: { type: "string" },
        thirdPersonMode: { type: "bool" },
      },
    },

    // Legacy
    confirmedDiscordRooms: {
      type: "array",
      items: { type: "string" },
    },

    confirmedBroadcastedRooms: {
      type: "array",
      items: { type: "string" },
    },

    uploadPromotionTokens: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          fileId: { type: "string" },
          promotionToken: { type: "string" },
        },
      },
    },

    creatorAssignmentTokens: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          hubId: { type: "string" },
          creatorAssignmentToken: { type: "string" },
        },
      },
    },

    embedTokens: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          hubId: { type: "string" },
          embedToken: { type: "string" },
        },
      },
    },

    onLoadActions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          action: { type: "string" },
          args: { type: "object" },
        },
      },
    },
  },

  type: "object",

  properties: {
    profile: { $ref: "#/definitions/profile" },
    credentials: { $ref: "#/definitions/credentials" },
    activity: { $ref: "#/definitions/activity" },
    settings: { $ref: "#/definitions/settings" },
    preferences: { $ref: "#/definitions/preferences" },
    confirmedDiscordRooms: { $ref: "#/definitions/confirmedDiscordRooms" }, // Legacy
    confirmedBroadcastedRooms: { $ref: "#/definitions/confirmedBroadcastedRooms" },
    uploadPromotionTokens: { $ref: "#/definitions/uploadPromotionTokens" },
    creatorAssignmentTokens: { $ref: "#/definitions/creatorAssignmentTokens" },
    embedTokens: { $ref: "#/definitions/embedTokens" },
    onLoadActions: { $ref: "#/definitions/onLoadActions" },
  },

  additionalProperties: false,
};

export class Store extends EventTarget implements IService {
  constructor() {
    super();

    if (typeof localStorage !== "undefined") {
      if (localStorage.getItem(LOCAL_STORE_KEY) === null) {
        localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify({}));
      }
    }

    // When storage is updated in another window
    window.addEventListener("storage", (e) => {
      if (e.key !== LOCAL_STORE_KEY) return;
      delete this[STORE_STATE_CACHE_KEY];
      this.dispatchEvent(new CustomEvent("statechanged") as any);
    });
  }

  getType(): string {
    return Store.name;
  }

  get state() {
    if (!this[STORE_STATE_CACHE_KEY] && typeof localStorage !== "undefined") {
      this[STORE_STATE_CACHE_KEY] = JSON.parse(localStorage.getItem(LOCAL_STORE_KEY));
    }

    return this[STORE_STATE_CACHE_KEY];
  }

  clearStoredArray(key) {
    const overwriteMerge = (destinationArray, sourceArray) => sourceArray;
    const update = {};
    update[key] = [];

    this.update(update, { arrayMerge: overwriteMerge });
  }

  update(newState, mergeOpts = null) {
    const finalState = merge(this.state, newState, mergeOpts);
    const { valid } = validator.validate(finalState, SCHEMA);

    if (!valid) {
      // Intentionally not including details about the state or validation result here, since we don't want to leak
      // sensitive data in the error message.
      console.log(`Write to store failed schema validation.`);
      //throw new Error(`Write to store failed schema validation.`);
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(finalState));
    }
    delete this[STORE_STATE_CACHE_KEY];

    this.dispatchEvent(new CustomEvent("statechanged") as any);

    return finalState;
  }
}
