import { ObjectContentOrigins } from "../../../../object-types";
import { addMedia } from "../../../../utils/media-utils";

export async function pinEntity(entity) {
  return NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
    entity = networkedEl;
    if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) {
      return entity;
    } else {
      //Pin the new object by default
      entity.setAttribute("pinnable", "pinned", true);
      entity.emit("pinned", { el: entity });
      return entity;
    }
  });
}

export async function unpinEntity(entity) {
  return NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
    entity = networkedEl;
    if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) {
      return entity;
    } else {
      //Pin the new object by default
      entity.setAttribute("pinnable", "pinned", false);
      entity.emit("unpinned", { el: entity });
      return entity;
    }
  });
}

export function addMediaAndSetTransform(src, position, quaternion, scale, mediaOptions, contentOrigin, shouldPin) {
  if (!contentOrigin) {
    contentOrigin = ObjectContentOrigins.URL;
  }
  let { entity } = addMedia(
      src,
      "#interactable-media",//#static-controlled-media
      contentOrigin,
      mediaOptions.type && mediaOptions.type.includes("360") ? "360-equirectangular" : null,
      !(src instanceof MediaStream),
      true,
      true,
      mediaOptions ? mediaOptions : {}
  );
  entity.object3D.position.set(position.x, position.y, position.z);
  //entity.object3D.rotation.copy(orientationRecv);
  entity.object3D.setRotationFromQuaternion(quaternion);
  entity.object3D.scale.set(scale.x, scale.y, scale.z);
  entity.object3D.matrixNeedsUpdate = true;
  //important for case where I thrash the screen TODO workaround user can just deactivate screen share mode (no othe solution sice it cause a bug elsewhere
  entity.setAttribute("emit-scene-event-on-remove", "event:action_end_video_sharing");
  if (shouldPin) {
    pinEntity(entity);
  }
  return entity;
}

/*export function addMediaAndSetTransformWithRespawnStatic(src, position, orientationRecv, scale, mediaOptions, contentOrigin,shouldPin,networkId) {
  let entity = addMediaAndSetTransform(src, position, orientationRecv, scale, mediaOptions, contentOrigin,shouldPin);
  entity.setAttribute("emit-scene-event-on-remove", "event:action_end_video_sharing");
}*/

export function spawnMedia(src, contentOrigin, data) {
  const { entity, orientation } = addMedia(
    src,
    "#interactable-media",
    contentOrigin,
    data && data.type && data.type.includes("360") ? "360-equirectangular" : null,
    !(src instanceof MediaStream),
    true,
    true,
    data ? data : {}
  );
  return  { entity, orientation };
}

export function spawnMediaInfrontOfPlayer(src, contentOrigin, data) {
  const offset = { x: 0, y: 0, z: -1.5 };
  const { entity, orientation } = spawnMedia(src, contentOrigin, data);
  orientation.then(or => {
    entity.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset,
      orientation: or
    });
  });
  return entity;
}
