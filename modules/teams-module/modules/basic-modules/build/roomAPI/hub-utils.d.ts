export declare function createHubChannelParams({ permsToken, profile, pushSubscriptionEndpoint, isMobile, isMobileVR, isEmbed, hubInviteId, authToken }: {
    permsToken: any;
    profile: any;
    pushSubscriptionEndpoint: any;
    isMobile: any;
    isMobileVR: any;
    isEmbed: any;
    hubInviteId: any;
    authToken: any;
}): {
    profile: any;
    push_subscription_endpoint: any;
    auth_token: any;
    perms_token: any;
    context: {
        mobile: any;
        embed: any;
        hmd: any;
    };
    hub_invite_id: any;
};
