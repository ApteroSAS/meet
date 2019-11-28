import { getLastWorldPosition } from "../utils/three-utils";
import { CAMERA_MODE_FIRST_PERSON } from "../systems/camera-system";
import { getBox } from "../utils/auto-box-collider";

AFRAME.registerComponent("position-at-shape-border", {
  multiple: true,
  schema: {
    target: { type: "string" },
    animate: { default: true },
    scale: { default: true }
  },

  init() {
    this.cam = this.el.sceneEl.camera.el.object3D;
    this._updateBox = this._updateBox.bind(this);
    this._setupTarget = this._setupTarget.bind(this);
    this.halfExtents = new THREE.Vector3();
    this.el.sceneEl.systems["frame-scheduler"].schedule(this._updateBox, "media-components");
  },

  remove() {
    this.el.sceneEl.systems["frame-scheduler"].unschedule(this._updateBox, "media-components");
  },

  update() {
  },

  _setupTarget() {
    this.targetEl = this.el.querySelector(this.data.target);
    if (!this.targetEl) {
      console.warn(`Race condition on position-at-box-shape-border on selector ${this.data.target}`);
      return;
    }

    this.target = this.targetEl.object3D;

    this.targetEl.addEventListener("animationcomplete", () => {
      this.targetEl.removeAttribute("animation__show");
    });

    this.target.scale.setScalar(0.01); // To avoid "pop" of gigantic button first time
    this.target.matrixNeedsUpdate = true;
  },

  tick() {
    if (!this.target) {
      this._setupTarget();
      return;
    }

    if (!this.el.getObject3D("mesh")) {
      return;
    }

    const isVisible = this.targetEl.object3D.visible;
    const opening = isVisible && !this.wasVisible;
    const scaleChanged =
      this.el.object3D.scale.x !== this.previousScaleX ||
      this.el.object3D.scale.y !== this.previousScaleY ||
      this.el.object3D.scale.z !== this.previousScaleZ;
    const isAnimating = this.targetEl.getAttribute("animation__show");

    // If the target is being shown or the scale changed while the opening animation is being run,
    // we need to start or re-start the animation.
    if (opening || (scaleChanged && isAnimating)) {
      this._updateBox(this.data.animate, true);
    }

    this.wasVisible = isVisible;
    this.previousScaleX = this.el.object3D.scale.x;
    this.previousScaleY = this.el.object3D.scale.y;
    this.previousScaleZ = this.el.object3D.scale.z;
  },

  _updateBox: (function() {
    const camWorldPos = new THREE.Vector3();
    const objWorldPos = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const tempParentWorldScale = new THREE.Vector3();
    const targetDir = new THREE.Vector3();
    const camWorldDirection = new THREE.Vector3();
    const zero = new THREE.Vector3();

    return function(animate, forceNewExtents) {
      let objectSize =0.5;
      if (forceNewExtents || this.mesh !== this.el.getObject3D("mesh")) {
        this.mesh = this.el.getObject3D("mesh");
        const box = getBox(this.el, this.mesh);
        objectSize = zero.distanceTo(box.max);
      }
      if (!this.target) return;

      getLastWorldPosition(this.cam, camWorldPos);

      this.el.object3D.updateMatrices();

      this.el.object3D.getWorldPosition(objWorldPos)
      targetDir.subVectors(camWorldPos,objWorldPos);
      targetDir.normalize();
      targetDir.multiplyScalar(objectSize);

      /*this.cam.getWorldDirection(camWorldDirection);
      camWorldDirection.negate();
      camWorldDirection.normalize();
      camWorldDirection.multiplyScalar(objectSize);*/

      this.target.position.set(targetDir.x,targetDir.y,targetDir.z);//local to reference this.el.object3D
      this.target.lookAt(camWorldPos.x,camWorldPos.y,camWorldPos.z);//local to reference this.el.object3D
      //this.target.rotation.set(0, 0, 0);

      tempParentWorldScale.setFromMatrixScale(this.target.parent.matrixWorld);

      const distance = 1;
      const scale = Math.max(this.halfExtents.x, this.halfExtents.z) * distance;
      const targetScale = Math.min(
        this.el.sceneEl.systems["hubs-systems"].cameraSystem.mode === CAMERA_MODE_FIRST_PERSON ? 2.0 : 4.0,
        Math.max(0.5, scale * tempParentWorldScale.x)
      );
      const finalScale = this.data.scale ? targetScale / tempParentWorldScale.x : 1;

      if (animate) {
        this.targetEl.removeAttribute("animation__show");

        this.targetEl.setAttribute("animation__show", {
          property: "scale",
          dur: 300,
          from: { x: finalScale * 0.8, y: finalScale * 0.8, z: finalScale * 0.8 },
          to: { x: finalScale, y: finalScale, z: finalScale },
          easing: "easeOutElastic"
        });
      } else if (!this.targetEl.getAttribute("animation__show")) {
        this.target.scale.setScalar(finalScale);
      }

      this.target.matrixNeedsUpdate = true;
    };
  })()
});
