export function createHubChannelParams({ permsToken, profile, pushSubscriptionEndpoint, isMobile, isMobileVR, isEmbed, hubInviteId, authToken }) {
  return {
    profile,
    push_subscription_endpoint: pushSubscriptionEndpoint,
    auth_token: authToken || null,
    perms_token: permsToken || null,
    context: {
      mobile: isMobile || isMobileVR,
      embed: isEmbed,
      hmd: isMobileVR,
    },
    hub_invite_id: hubInviteId,
  };
}
