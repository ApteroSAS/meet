export const propertiesService = window.APP_PROPS;
window.APP_CONFIG = propertiesService.APP_CONFIG;

export function registerProperties() {
  /*if(!process) {
    process = {};
  }*/
  if (!process.env) {
    process.env = {};
  }
  process.env = { ...propertiesService, ...process.env };
}
