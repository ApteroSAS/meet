import { fetchReticulumAuthenticated } from "./phoenix-utils";

const names = [
  "Guest"
];

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomName() {
  return `${chooseRandom(names)}-${Math.floor(10000 + Math.random() * 10000)}`;
}

export async function fetchRandomDefaultAvatarId() {
  const defaultAvatarEndpoint = "/api/v1/media/search?filter=default&source=avatar_listings";
  const defaultAvatars = (await fetchReticulumAuthenticated(defaultAvatarEndpoint)).entries;
  if (defaultAvatars.length === 0) {
    // If reticulum doesn't return any default avatars, just default to the duck model. This should only happen
    // when running against a fresh reticulum server, e.g. a local ret instance.
    return "https://hub.aptero.co/data/avatar/A030/base.glb";
  }
  const avatarIds = defaultAvatars.map(avatar => avatar.id);
  return chooseRandom(avatarIds);
}
