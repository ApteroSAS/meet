import { EventTarget } from "event-target-shim";
import { IService } from "@aptero/axolotis-player";
export declare const SCHEMA: {
    id: string;
    definitions: {
        profile: {
            type: string;
            additionalProperties: boolean;
            properties: {
                displayName: {
                    type: string;
                    pattern: string;
                };
                avatarId: {
                    type: string;
                };
                companyName: {
                    type: string;
                };
                jobTitleName: {
                    type: string;
                };
                phoneNumber: {
                    type: string;
                };
                description: {
                    type: string;
                };
                profilePicture: {
                    type: string;
                };
                microsoftUserprofilePicture: {
                    type: string;
                };
                microsoftUser: {
                    type: string;
                };
                personalAvatarId: {
                    type: string;
                };
            };
        };
        credentials: {
            type: string;
            additionalProperties: boolean;
            properties: {
                token: {
                    type: string[];
                };
                email: {
                    type: string[];
                };
            };
        };
        activity: {
            type: string;
            additionalProperties: boolean;
            properties: {
                hasFoundFreeze: {
                    type: string;
                };
                hasChangedName: {
                    type: string;
                };
                hasAcceptedProfile: {
                    type: string;
                };
                hasChangedPicture: {
                    type: string;
                };
                hasChangedAvatar: {
                    type: string;
                };
                lastEnteredAt: {
                    type: string;
                };
                hasPinned: {
                    type: string;
                };
                hasRotated: {
                    type: string;
                };
                hasRecentered: {
                    type: string;
                };
                hasScaled: {
                    type: string;
                };
                hasHoveredInWorldHud: {
                    type: string;
                };
                hasOpenedShare: {
                    type: string;
                };
                entryCount: {
                    type: string;
                };
            };
        };
        settings: {
            type: string;
            additionalProperties: boolean;
            properties: {
                lastUsedMicDeviceId: {
                    type: string;
                };
                micMuted: {
                    type: string;
                };
            };
        };
        preferences: {
            type: string;
            additionalProperties: boolean;
            properties: {
                shouldPromptForRefresh: {
                    type: string;
                };
                preferredMic: {
                    type: string;
                };
                preferredCamera: {
                    type: string;
                };
                muteMicOnEntry: {
                    type: string;
                };
                audioOutputMode: {
                    type: string;
                };
                audioNormalization: {
                    type: string;
                };
                invertTouchscreenCameraMove: {
                    type: string;
                };
                enableOnScreenJoystickLeft: {
                    type: string;
                };
                enableOnScreenJoystickRight: {
                    type: string;
                };
                enableGyro: {
                    type: string;
                };
                onlyShowNametagsInFreeze: {
                    type: string;
                };
                animateWaypointTransitions: {
                    type: string;
                };
                showFPSCounter: {
                    type: string;
                };
                allowMultipleHubsInstances: {
                    type: string;
                };
                disableIdleDetection: {
                    type: string;
                };
                fastRoomSwitching: {
                    type: string;
                };
                preferMobileObjectInfoPanel: {
                    type: string;
                };
                maxResolutionWidth: {
                    type: string;
                };
                maxResolutionHeight: {
                    type: string;
                };
                globalVoiceVolume: {
                    type: string;
                };
                globalMediaVolume: {
                    type: string;
                };
                snapRotationDegrees: {
                    type: string;
                };
                materialQualitySetting: {
                    type: string;
                };
                enableDynamicShadows: {
                    type: string;
                };
                disableSoundEffects: {
                    type: string;
                };
                disableMovement: {
                    type: string;
                };
                disableBackwardsMovement: {
                    type: string;
                };
                disableStrafing: {
                    type: string;
                };
                disableTeleporter: {
                    type: string;
                };
                disableAutoPixelRatio: {
                    type: string;
                };
                movementSpeedModifier: {
                    type: string;
                };
                disableEchoCancellation: {
                    type: string;
                };
                disableNoiseSuppression: {
                    type: string;
                };
                disableAutoGainControl: {
                    type: string;
                };
                locale: {
                    type: string;
                };
                showRtcDebugPanel: {
                    type: string;
                };
                showAudioDebugPanel: {
                    type: string;
                };
                enableAudioClipping: {
                    type: string;
                };
                audioClippingThreshold: {
                    type: string;
                };
                theme: {
                    type: string;
                };
                thirdPersonMode: {
                    type: string;
                };
            };
        };
        confirmedDiscordRooms: {
            type: string;
            items: {
                type: string;
            };
        };
        confirmedBroadcastedRooms: {
            type: string;
            items: {
                type: string;
            };
        };
        uploadPromotionTokens: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    fileId: {
                        type: string;
                    };
                    promotionToken: {
                        type: string;
                    };
                };
            };
        };
        creatorAssignmentTokens: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    hubId: {
                        type: string;
                    };
                    creatorAssignmentToken: {
                        type: string;
                    };
                };
            };
        };
        embedTokens: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    hubId: {
                        type: string;
                    };
                    embedToken: {
                        type: string;
                    };
                };
            };
        };
        onLoadActions: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    action: {
                        type: string;
                    };
                    args: {
                        type: string;
                    };
                };
            };
        };
    };
    type: string;
    properties: {
        profile: {
            $ref: string;
        };
        credentials: {
            $ref: string;
        };
        activity: {
            $ref: string;
        };
        settings: {
            $ref: string;
        };
        preferences: {
            $ref: string;
        };
        confirmedDiscordRooms: {
            $ref: string;
        };
        confirmedBroadcastedRooms: {
            $ref: string;
        };
        uploadPromotionTokens: {
            $ref: string;
        };
        creatorAssignmentTokens: {
            $ref: string;
        };
        embedTokens: {
            $ref: string;
        };
        onLoadActions: {
            $ref: string;
        };
    };
    additionalProperties: boolean;
};
export declare class Store extends EventTarget implements IService {
    constructor();
    getType(): string;
    get state(): any;
    clearStoredArray(key: any): void;
    update(newState: any, mergeOpts?: any): unknown;
}
