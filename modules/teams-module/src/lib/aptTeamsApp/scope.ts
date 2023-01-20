export function getScopesLight() {
  //must be the same as permission.json
  //import perm from "../../../../permissions.json"
  //Try to avoid admin consent for authorization
  return [
    // Teams app permission
    "User.Read", // Use for basic email, call and chat call to action, Avatar image and name
  ];
}

export function getScopes() {
  //Try to avoid admin consent for authorization
  return [
    // Teams app permission
    //"Contacts.Read", //use for visit card
    //"Presence.Read.All", //use for visit card
    //"People.Read", //use for visit card
    "User.Read", //organisation info  / profile info
    "User.ReadBasic.All", // Use for basic email, call and chat call to action, Avatar image and name
    //Permission for the web part
    "profile", //Avatar image and name - Mandatory
    "openid", //Avatar image and name - Mandatory
    "Files.Read", //Use to add content in the 3d space (pdf, img, mp4 etc...)
    "Files.Read.All", //Use to add content in the 3d space (pdf, img, mp4 etc...)
  ];
}
