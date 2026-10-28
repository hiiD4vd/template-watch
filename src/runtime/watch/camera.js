import { events } from './config';
import { lerp } from './math';
import { Vector3, PerspectiveCamera, Vector2 } from 'three';
import { engine, engineEvents, project } from '../engine';
const cameraFieldOfView = 25;
const cameraLookTarget = new Vector3();
class WatchCamera extends PerspectiveCamera {
  constructor() {
    super(cameraFieldOfView, engine.tools.viewport.ratio, 0.3, 15);
    this.orbitControls = undefined;
    this.handleInitProject = () => {};
    this.handleAttachProject = () => {
      var e;
      engine.state.on(engineEvents.RESIZE, this.handleResize);
      (e = project.debug) == null || e.mapping.add(this, 'Camera');
      engine.$app.addEventListener('touchmove', this.onTouchMove);
      engine.$app.addEventListener('touchstart', this.onTouchStart);
      document.addEventListener('wheel', this.onWheel);
    };
    this.handleDetachProject = () => {
      var e;
      engine.state.off(engineEvents.RESIZE, this.handleResize);
      project.state.off(events.INIT_PROJECT, this.handleInitProject);
      project.state.off(events.ATTACH_PROJECT, this.handleAttachProject);
      project.state.off(events.DETACH_PROJECT, this.handleDetachProject);
      project.state.off(events.DESTROY_PROJECT, this.handleDestroyProject);
      engine.$app.removeEventListener('touchmove', this.onTouchMove);
      engine.$app.removeEventListener('touchstart', this.onTouchStart);
      document.removeEventListener('wheel', this.onWheel);
      (e = project.debug) == null || e.mapping.remove(this);
    };
    this.handleDestroyProject = () => {};
    this.handleResize = ({ ratio: aspect }) => {
      this.aspect = aspect;
      this.fov = cameraFieldOfView / Math.min(1, aspect * 1.5);
      this.updateProjectionMatrix();
    };
    this.onTouchStart = (event) => {
      this.dragPosition.start =
        event.touches[0].clientX / engine.tools.viewport.width;
    };
    this.onTouchMove = (event) => {
      !this.dragPosition.canDrag ||
        project.webgl.globalUniforms.clickedIndex.value !== null ||
        ((this.dragPosition.target.x -=
          (event.touches[0].clientX / engine.tools.viewport.width -
            this.dragPosition.start) *
          0.5),
        (this.dragPosition.target.x = Math.min(
          Math.max(this.dragPosition.target.x, -this.dragPosition.limit),
          this.dragPosition.limit,
        )));
    };
    this.onWheel = () => {
      this.parallaxIntensity.target = 0;
    };
    this.radius = 10;
    this.theta = Math.PI * 0.5;
    this.phi = Math.PI * 0.5;
    this.lookAtPosition = {
      value: new Vector3(0, 0, 0),
      target: new Vector3(0, 0, 0),
    };
    this.dragPosition = {
      value: new Vector3(0, 0, 0),
      target: new Vector3(0, 0, 0),
      intensity: 0,
      start: 0,
      canDrag: false,
      limit: 1.5,
    };
    this.animationTheta = 0;
    this.animationPhi = 0;
    this.mouse = {
      value: new Vector2(0, 0),
      target: new Vector2(0, 0),
    };
    this.parallaxIntensity = {
      value: 0,
      target: 0,
    };
    this.radiusMultiplier = 1;
    this.parallaxIntensityMultiplier = 1;
    this.parallaxIntensityMultiplierAdd = 0;
    this.longpressZoomMultiplier = 1;
    this.parallaxIntensityOpen = 0;
    project.state.on(events.INIT_PROJECT, this.handleInitProject);
    project.state.on(events.ATTACH_PROJECT, this.handleAttachProject);
    project.state.on(events.DETACH_PROJECT, this.handleDetachProject);
    project.state.on(events.DESTROY_PROJECT, this.handleDestroyProject);
    engine.state.register(this);
  }
  onTick({ et: elapsedTime, dt: deltaTime }) {
    this.orbitControls ||
      ((this.parallaxIntensity.value = lerp(
        this.parallaxIntensity.value,
        this.parallaxIntensity.target,
        deltaTime * (this.parallaxIntensity.target === 0 ? 0.1 : 7),
      )),
      (this.parallaxIntensitySum =
        this.parallaxIntensityMultiplier +
        this.parallaxIntensityMultiplierAdd +
        project.webgl.scene.xplodAllProgress),
      this.mouse.value
        .lerp(this.mouse.target, deltaTime)
        .multiplyScalar(this.parallaxIntensity.value)
        .multiplyScalar(this.parallaxIntensitySum)
        .multiplyScalar(this.parallaxIntensityOpen),
      (this.theta = lerp(
        this.theta,
        (this.mouse.value.x + 0.5) * Math.PI,
        deltaTime * 2,
      )),
      (this.phi = lerp(
        this.phi,
        (this.mouse.value.y + 0.5) * Math.PI,
        deltaTime * 2,
      )),
      this.dragPosition.value.lerp(this.dragPosition.target, deltaTime * 4),
      engine.tools.viewport.breakpoint !== 'desktop' &&
      this.dragPosition.canDrag &&
      project.webgl.globalUniforms.clickedIndex.value == null
        ? (cameraLookTarget.set(
            this.dragPosition.value.x,
            this.lookAtPosition.target.y,
            this.lookAtPosition.target.z,
          ),
          this.lookAtPosition.value.lerp(cameraLookTarget, deltaTime * 1.5))
        : this.lookAtPosition.value.lerp(
            this.lookAtPosition.target,
            deltaTime * 3,
          ),
      (this.position.x =
        this.dragPosition.value.x * this.dragPosition.intensity +
        this.radius *
          this.radiusMultiplier *
          Math.sin(this.phi + this.animationPhi) *
          Math.cos(this.theta + this.animationTheta)),
      (this.position.y =
        this.dragPosition.value.y * this.dragPosition.intensity +
        this.radius *
          this.radiusMultiplier *
          Math.cos(this.phi + this.animationPhi)),
      (this.position.z =
        this.dragPosition.value.z * this.dragPosition.intensity +
        this.radius *
          this.radiusMultiplier *
          Math.sin(this.phi + this.animationPhi) *
          Math.sin(this.theta + this.animationTheta) -
        project.webgl.longpress.intensity *
          3 *
          this.parallaxIntensitySum *
          this.longpressZoomMultiplier),
      this.lookAt(this.lookAtPosition.value));
  }
  onPointerMove({ webgl: value }) {
    this.mouse.target.copy(
      value.multiplyScalar(1 + project.webgl.longpress.intensity),
    );
    engine.tools.viewport.breakpoint === 'desktop' ||
    project.dom.lenis.isStopped
      ? ((this.parallaxIntensity.target = 0.9),
        clearTimeout(this.pTimeOut),
        (this.pTimeOut = setTimeout(() => {
          this.parallaxIntensity.target = 0;
        }, 1e3)))
      : (this.parallaxIntensity.target = 0);
  }
}
export { WatchCamera };
