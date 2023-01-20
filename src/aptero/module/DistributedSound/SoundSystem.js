export default class SoundSystem {
  constructor(networkService) {
    this.networkService = networkService;
  }

  async start() {
    this.networkService.onMessage("chat_events:sound_db_updated", ({ session_id, type, body, from }) => {
      if (!body) {
        return;
      }
      console.log("chat_events:sound_db_updated :", body);
      /*
          distanceModel: {
          default: "inverse",
          oneOf: ["linear", "inverse", "exponential"]
        },
        maxDistance: { default: 10000 },
        refDistance: { default: 1 },
        rolloffFactor: { default: 1 }
      * */
      //1 change room parameter in mongodb (need jwt in request) => OK with rest
      //2 ask everyone to update from room parameter (or room server send a broadcast via chat?) => OK
      //3 dynmicaly change switch the sound? for each client
      //parcour all naf entities and find avatar-audio-source and change audio
      Object.keys(NAF.entities.entities).forEach(key => {
        let entity = NAF.entities.entities[key];
        let elementsByTagName = entity.getElementsByTagName("a-entity") || [];
        let head = null;
        for (let i = 0; i < elementsByTagName.length; i++) {
          let element = elementsByTagName[i];
          if (element.className === "Head") {
            head = element;
          }
        }
        this.updateAvatarAudioSourceSound(head,body)

      });
    });

  }

  updateAvatarAudioSourceSound(head,body){
    if (head) {
      let audioComponent = head.components["audio-params"];
      if (audioComponent) {
        let config = {
          rolloffFactor: body.rolloffFactor || audioComponent.data.rolloffFactor,
          distanceModel: body.distanceModel || audioComponent.data.distanceModel,
          maxDistance: body.maxDistance || audioComponent.data.maxDistance,
          refDistance: body.refDistance || audioComponent.data.refDistance
        };
        head.setAttribute("audio-params", "rolloffFactor: " + config.rolloffFactor + ";" + "distanceModel: " + config.distanceModel + ";" + "maxDistance: " + config.maxDistance + ";" + "refDistance: " + config.refDistance + ";");
        console.log(audioComponent);
      }
    }
  }
}
