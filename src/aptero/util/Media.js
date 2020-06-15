import { ObjectContentOrigins } from "../../object-types";
import { addMedia } from "../../utils/media-utils";

export function pinEntity(entity){
  NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
    entity = networkedEl;
    if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) return entity;
    //Pin the new object by default
    entity.setAttribute("pinnable", "pinned", true);
    entity.emit("pinned", { el: entity });
  });
}

export function addMediaAndSetTransform(src, position, orientationRecv, scale, mediaOptions, contentOrigin,shouldPin) {
  if (!contentOrigin) {
    contentOrigin = ObjectContentOrigins.URL;
  }
  let { entity } = addMedia(
    src,
    "#interactable-media",
    contentOrigin,
    mediaOptions.type && mediaOptions.type.includes("360")?"360-equirectangular":null,
    !(src instanceof MediaStream),
    true,
    true,
    mediaOptions ? mediaOptions : {}
  );
  entity.object3D.position.set(position.x, position.y, position.z);
  entity.object3D.rotation.copy(orientationRecv);
  entity.object3D.scale.set(scale.x, scale.y, scale.z);
  entity.object3D.matrixNeedsUpdate = true;
  entity.setAttribute("emit-scene-event-on-remove", "event:action_end_video_sharing");
  if (shouldPin) {
    pinEntity(entity);
  }
  return entity;
}

