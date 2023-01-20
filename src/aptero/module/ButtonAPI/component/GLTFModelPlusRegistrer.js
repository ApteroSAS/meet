
export function registerCustomGLTFModelPlusComponents(){
  AFRAME.GLTFModelPlus.registerComponent(
    "trigger",
    "trigger",
    (el, componentName, componentData, components, indexToEntityMap) => {
      const {
        size,
        target,
        enterComponent,
        enterProperty,
        enterValue,
        leaveComponent,
        leaveProperty,
        leaveValue
      } = componentData;

      // Filter out scope and colliders properties.
      el.setAttribute("trigger", {
        colliders: "#avatar-pov-node",
        size,
        target: target,
        enterComponent: enterComponent,
        enterProperty: enterProperty,
        enterValue: enterValue,
        leaveComponent: leaveComponent,
        leaveProperty: leaveProperty,
        leaveValue: leaveValue
      });
    }
  );
}