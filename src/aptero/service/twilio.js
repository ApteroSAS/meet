export async function fetchICEservers() {
  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Basic U0tjYzMxZDM0N2YxOGVlYmM3MjNiMDgzNTc0ZTE2MWJjMDp6bFM1TjNmbGhWMEdOc0ZLcG1vbFBucW1TcWdMbEliNQ=="
  );

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow"
  };
  const twilioApi = "https://api.twilio.com/2010-04-01/Accounts/AC2b4884e41acc8b8ed9f7ee795969d76b/Tokens.json";
  const resp = await fetch(twilioApi, requestOptions);
  const servers = await resp.json();
  window.iceServers = [...servers.ice_servers];
  return servers;
}

export function configureTurn(forceTurn,forceTcp,adapter) {
  let peerConnectionConfig = adapter.peerConnectionConfig || {};
  peerConnectionConfig.iceServers = window.iceServers || peerConnectionConfig.iceServers; //APTERO
  adapter.setPeerConnectionConfig(peerConnectionConfig);
}