import { events } from './config';
import { LongPress } from './interaction';
import { damp } from './math';
import { WatchCamera } from './camera';
import {
  WatchScene,
  ParticlesCamera,
  ParticlesScene,
  PostProcessing,
} from './scene';
import { webglSections } from './scenes';
import { Vector2, WebGLRenderTarget } from 'three';
import { engine, project } from '../engine';
class SectionsController {
  constructor({ selector = 'webgl' } = {}) {
    this.scrollDirection = void 0;
    this.scrollPosition = void 0;
    this.previousScrollTarget = void 0;
    this.scrollDelta = void 0;
    this.previousScrollDelta = void 0;
    this.domScrollPosition = void 0;
    this.scrollAcceleration = void 0;
    this.initializeSections = () => {
      document.addEventListener('scroll', this.handleScroll, {
        passive: true,
      });
      this.sections = Array.from(
        document.querySelectorAll(`[data-${this.selector}]`),
      ).map(
        (element, index) =>
          new webglSections[element.dataset[this.selector]](element, index),
      );
      this.sections[0].isFirstSection = true;
      this.sections[this.sections.length - 1].isLastSection = true;
      project.state.emit(events.OPEN_PROJECT);
    };
    this.handleScroll = (value) => {
      const targetScroll = window.scrollY;
      this.previousScrollTarget = this.targetScroll;
      this.targetScroll = targetScroll;
      this.previousScrollDelta = this.scrollDelta;
      this.scrollDelta = this.previousScrollTarget - this.targetScroll;
      this.scrollAcceleration =
        (this.scrollDelta - this.previousScrollDelta) * this.scrollDirection;
      this.scrollDirection = Math.sign(targetScroll - this.scrollPosition);
    };
    this.onTick = ({ et: elapsedTime, dt: deltaTime }) => {
      var s;
      this.scrollPosition = damp(
        this.scrollPosition,
        this.targetScroll,
        2 * this.scrollDampMultiply,
        deltaTime,
      );
      this.domScrollPosition = damp(
        this.domScrollPosition,
        this.targetScroll,
        4 * this.scrollDampMultiply,
        deltaTime,
      );
      (s = this.sections) == null ||
        s.forEach((item) => {
          item.updateProgress(this.scrollPosition, this.scrollDirection);
          item.updateDOMProgress(this.domScrollPosition, this.scrollDirection);
        });
    };
    engine.state.register(this);
    project.state.on(events.VIEW_READY_PROJECT, this.initializeSections);
    this.targetScroll = 0;
    this.selector = selector;
    this.scrollDirection = 1;
    this.domScrollPosition =
      this.scrollPosition =
      this.targetScroll =
        window.scrollY;
    this.scrollDampMultiply = 1;
  }
  get velocity() {
    return (this.targetScroll - this.scrollPosition) * this.scrollDirection;
  }
  get currentScroll() {
    return this.scrollPosition;
  }
  set currentScroll(scrollPosition) {
    this.scrollPosition = scrollPosition;
  }
  set currentDOMScroll(domScrollPosition) {
    this.domScrollPosition = domScrollPosition;
  }
  get globalProgress() {
    return this.sections.reduce((value, value2) => value + value2.progress, 0);
  }
}
class WatchWebGL {
  constructor() {
    this.handleAttachProject = () => {
      this.postProcessing.material.uniforms.uMouse = this.globalUniforms.uMouse;
    };
    this.handleDetachProject = () => {
      engine.state.unregister(this);
    };
    this.camera = new WatchCamera();
    this.scene = new WatchScene();
    this.globalUniforms = {
      uInvertProgress: {
        value: 0,
      },
      uDarknessProgress: {
        value: 0,
      },
      uMouse: {
        value: new Vector2(0, 0),
      },
      clickedIndex: {
        value: null,
      },
    };
    this.mouse = {
      value: new Vector2(0, 0),
    };
    engine.state.register(this);
    project.state.on(events.ATTACH_PROJECT, this.handleAttachProject);
    project.state.on(events.DETACH_PROJECT, this.handleDetachProject);
    this.sectionsController = new SectionsController();
    this.renderTarget1 = new WebGLRenderTarget(
      engine.tools.viewport.width * engine.tools.viewport.dpr,
      engine.tools.viewport.height * engine.tools.viewport.dpr,
    );
    this.renderTarget2 = new WebGLRenderTarget(
      engine.tools.viewport.width * engine.tools.viewport.dpr,
      engine.tools.viewport.height * engine.tools.viewport.dpr,
    );
    this.currentRenderTarget = this.renderTarget1;
    this.nextRenderTarget = this.renderTarget2;
    this.particlesScene = new ParticlesScene();
    this.particlesCamera = new ParticlesCamera();
    this.postProcessing = new PostProcessing();
    this.longpressData = {
      direction: 0,
      lastIntensity: 0,
      scrollEnabled: true,
    };
    const t = (value) => {
      var s, n;
      project.webgl.postProcessing.material.uniforms.uLongpress.value = value;
      this.longpressData.direction =
        value === this.longpressData.lastIntensity
          ? this.longpressData.direction
          : value > this.longpressData.lastIntensity
            ? 1
            : -1;
      this.longpressData.direction > 0 && this.longpressData.scrollEnabled
        ? (project.state.emit(events.LONGPRESS_TOGGLE, true),
          (s = project.dom.lenis) == null || s.stop(),
          project.dom.el.classList.add('longpress'),
          (this.longpressData.scrollEnabled = false))
        : this.longpressData.direction <= 0 &&
          !this.longpressData.scrollEnabled &&
          (project.state.emit(events.LONGPRESS_TOGGLE, false),
          project.dom.el.classList.remove('longpress'),
          (n = project.dom.lenis) == null || n.start(),
          (this.longpressData.scrollEnabled = true));
      this.longpressData.lastIntensity = value;
    };
    this.longpress = new LongPress(engine.$app, t, {
      activationDelay: 500,
      duration: 2e3,
      ease: 'power3.inOut',
    });
  }
  get wrapper() {
    return this.scene.wrapper;
  }
  get watch() {
    return this.scene.model;
  }
  onRender({ et: elapsedTime, dt: deltaTime }) {
    var s, n, r;
    this.globalUniforms.uMouse.value.lerp(
      engine.tools.mouse.coordinates.webgl,
      deltaTime * 1,
    );
    (s = project.debug) == null || s.stats.instance.begin();
    this.particlesScene &&
      this.particlesScene.particlesPlane &&
      this.particlesScene.visible &&
      ((this.particlesScene.particles.material.uniforms.uPass.value = 1),
      (this.particlesScene.particlesPlane.material.uniforms.uPass.value = 1),
      engine.webgl.renderer.setRenderTarget(this.currentRenderTarget),
      engine.webgl.renderer.clear(),
      engine.webgl.renderer.render(this.particlesScene, this.particlesCamera),
      (this.particlesScene.particlesPlane.material.uniforms.tDiffuse.value =
        this.currentRenderTarget.texture),
      ([this.currentRenderTarget, this.nextRenderTarget] = [
        this.nextRenderTarget,
        this.currentRenderTarget,
      ]),
      (this.particlesScene.particles.material.uniforms.uPass.value = 0),
      (this.particlesScene.particlesPlane.material.uniforms.uPass.value = 0));
    engine.webgl.renderer.setRenderTarget(this.postProcessing.renderTarget);
    engine.webgl.renderer.clear();
    this.particlesScene.particlesPlane &&
      engine.webgl.renderer.render(
        this.particlesScene.particlesPlane,
        this.particlesCamera,
      );
    engine.webgl.renderer.render(this.scene, this.camera);
    this.postProcessing.material.uniforms.tDiffuse.value =
      this.postProcessing.renderTarget.texture;
    engine.webgl.renderer.setRenderTarget(null);
    engine.webgl.renderer.render(
      this.postProcessing.postScene,
      this.postProcessing.camera,
    );
    (n = project.debug) == null || n.stats.instance.end();
    (r = project.debug) == null || r.stats.instance.update();
  }
  onResize({ width: value, height: value2, dpr: value3 }) {
    this.onRender({
      et: 0,
      dt: 0,
    });
    this.renderTarget1.setSize(
      Math.floor(value * value3),
      Math.floor(value2 * value3),
    );
    this.renderTarget2.setSize(
      Math.floor(value * value3),
      Math.floor(value2 * value3),
    );
  }
}
export { WatchWebGL };
