import { events, storeKeys } from './config';
import { assetUrl } from '../../lib/assets';
import { SplitText } from './dom';
import { clamp, mapRange, lerp } from './math';
import { materialTypes, materialConfig } from './materials';
import {
  Vector3,
  Vector2,
  Color,
  Group,
  Raycaster,
  Box3,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Object3D,
  InstancedMesh,
} from 'three';
import { engine, engineEvents, project } from '../engine';
import { gsap } from 'gsap';
import { applyMaterials } from '../materials/helpers';
class WebGLSection extends Group {
  constructor(options, index) {
    super();
    this.handleViewReadyProject = () => {
      var e, s;
      (s = (e = this.timeline) == null ? void 0 : e.kill) == null || s.call(e);
      this.timeline = this.setupTimeline();
      this.domTimeline = this.setupDomTimeline();
    };
    this.createDebugText = () => {
      const element = document.createElement('div');
      element.classList.add('webgl-debug-progress');
      const element2 = document.createElement('div');
      element2.classList.add('webgl-debug-text');
      element.appendChild(element2);
      this.el.appendChild(element);
      this.debugText = this.el.querySelector('.webgl-debug-text');
    };
    this.onTick = () => {};
    this.index = index;
    project.state.on(events.VIEW_READY_PROJECT, this.handleViewReadyProject);
    this.el = options;
    this.isLastSection = this.isFirstSection = false;
    this.name = this.el.dataset.webgl;
    this.start = this.height = this.end = 0;
    this.progressWebgl = 0;
    this.lerpedProgressWebgl = 0;
    this.progress = 0;
    this.timeline = null;
    this.domTimeline = null;
    this.startOffset = 0;
    this.endOffset = 0;
    this.watch = engine.currentProject.webgl.scene.watch;
    this.camera = engine.currentProject.webgl.camera;
    this.watchParts = engine.currentProject.webgl.scene.watchParts;
    this.domSections = Array.from(this.el.querySelectorAll('section')).map(
      (item) => project.dom.sections.find((item2) => item2.el === item),
    );
    this.resize = this.resize.bind(this);
    engine.state.on(engineEvents.RESIZE, this.resize);
  }
  setupTimeline() {
    const timeline = gsap.timeline({
      paused: true,
    });
    timeline.call(() => {}, null, 1);
    return timeline;
  }
  setupDomTimeline() {
    const timeline = gsap.timeline({
      paused: true,
    });
    let s = 0;
    this.domSections.forEach((section) => {
      var r, l;
      if (section.component) {
        (l = (r = section.component.timeline) == null ? void 0 : r.kill) ==
          null || l.call(r);
        section.component.timeline = section.component.setupTimeline();
        const c = section.component.timeline;
        timeline.add(c, s);
        section.component.isFirstSection ||
          (s += c.duration() - engine.tools.viewport.height);
      }
    });
    return timeline;
  }
  resize() {
    var s, n;
    const bounds = this.el.getBoundingClientRect();
    this.start = bounds.top + window.scrollY - engine.tools.viewport.height;
    this.height = bounds.height;
    this.end = this.height + bounds.top + window.scrollY;
    this.webglStart =
      this.start + engine.tools.viewport.height * this.startOffset;
    this.webglEnd = this.end + engine.tools.viewport.height * this.endOffset;
    engine.tools.viewport.breakpoint !== this.oldBreakpoint &&
      this.oldBreakpoint !== void 0 &&
      ((n = (s = this.domTimeline) == null ? void 0 : s.kill) == null ||
        n.call(s),
      (this.domTimeline = this.setupDomTimeline()));
    this.oldBreakpoint = engine.tools.viewport.breakpoint;
  }
  enter(value) {
    this.hasEnter ||
      ((this.hasEnter = true),
      engine.state.register(this),
      project.state.register(this));
  }
  leave(value) {
    this.hasEnter &&
      ((this.hasEnter = false),
      engine.state.unregister(this),
      project.state.unregister(this));
  }
  enterCenter(value) {
    this.hasEnterCenter || (this.hasEnterCenter = true);
  }
  leaveCenter(value) {
    this.hasEnterCenter && (this.hasEnterCenter = false);
  }
  updateProgress(value, _dir) {
    var n;
    this.progressWebgl = clamp(
      mapRange(
        value,
        this.webglStart +
          (this.isFirstSection ? engine.tools.viewport.height : 0),
        this.webglEnd -
          (this.isLastSection ? +engine.tools.viewport.height : 0),
        0,
        1,
      ),
      0,
      1,
    );
    isNaN(this.progressWebgl) ||
      (this.lerpedProgressWebgl -=
        (this.lerpedProgressWebgl - this.progressWebgl) * 0.1);
    this.lerpedProgressWebgl = this.progressWebgl;
    (n = this.timeline) == null || n.progress(this.lerpedProgressWebgl);
    this._dir = _dir;
    value >= this.webglStart && value <= this.webglEnd && !this.hasEnter
      ? this.enter(_dir)
      : (value < this.webglStart || value > this.webglEnd) &&
        this.hasEnter &&
        this.leave(_dir);
    value >= this.webglStart + engine.tools.viewport.height * 0.5 &&
    value <= this.webglEnd - engine.tools.viewport.height * 0.5 &&
    !this.hasEnterCenter
      ? this.enterCenter(_dir)
      : (value < this.webglStart + engine.tools.viewport.height * 0.5 ||
          value > this.webglEnd - engine.tools.viewport.height * 0.5) &&
        this.hasEnterCenter &&
        this.leaveCenter(_dir);
    this.debugText &&
      (this.debugText.textContent = this.progressWebgl.toFixed(2));
  }
  updateDOMProgress(value, value2) {
    var n;
    this.progress = clamp(
      mapRange(
        value,
        this.start,
        this.end - (this.isLastSection ? engine.tools.viewport.height : 0),
        0,
        1,
      ),
      0,
      1,
    );
    (n = this.domTimeline) == null || n.progress(this.progress);
  }
}
class ColorsScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
    this.onConfigChange = ({
      configName: value = '',
      duration: value2 = 1,
    }) => {
      var n, r, l, c, h, f, p, v;
      project.store.set(storeKeys.CURRENT_CONFIG, value);
      // This asset collection contains photography for the first finish only.
      const photoFinish = 'first';
      (r = (n = project.dom) == null ? void 0 : n.el) == null ||
        r.querySelectorAll('[data-color-text]').forEach((element) => {
          var y, T;
          (T = element.classList) == null ||
            T.toggle(
              'selected',
              ((y = element.dataset) == null ? void 0 : y.config) == value,
            );
        });
      (c = (l = project.dom) == null ? void 0 : l.el) == null ||
        c.querySelectorAll('.single-img-w picture').forEach((item, index) => {
          const T = assetUrl(`images/gallery/${photoFinish}_${index + 1}.webp`);
          item.querySelectorAll('source, img').forEach((item2) => {
            item2.tagName === 'IMG' ? (item2.src = T) : (item2.srcset = T);
          });
        });
      (f = (h = project.dom) == null ? void 0 : h.el) == null ||
        f
          .querySelectorAll('[data-section="Parts"] .top-w img')
          .forEach((item, index) => {
            const T = assetUrl(`images/gallery/${photoFinish}_5.webp`);
            item.tagName === 'IMG' ? (item.src = T) : (item.srcset = T);
          });
      (v = (p = this.changeConfigTl) == null ? void 0 : p.kill) == null ||
        v.call(p);
      this.changeConfigTl = gsap.timeline({
        defaults: {
          duration: value2,
          ease: 'power3.inOut',
        },
      });
      this.configsPerMaterial.forEach((item) => {
        if (!item || !item.configs) return;
        let match = item.configs.find((item2) => item2.name == value);
        this.changeConfigTl.to(
          item.value.color,
          {
            r: match.color.r,
            g: match.color.g,
            b: match.color.b,
          },
          0,
        );
        this.changeConfigTl.to(
          item.value,
          {
            roughness: match.roughness,
          },
          0,
        );
        this.changeConfigTl.to(
          item.value,
          {
            metalness: match.metalness,
          },
          0,
        );
        this.changeConfigTl.to(
          item.value,
          {
            envMapIntensity: match.envMapIntensity,
          },
          0,
        );
        this.changeConfigTl.to(
          item.value,
          {
            additiveEnvMapIntensity: match.additiveEnvMapIntensity,
          },
          0,
        );
        this.changeConfigTl.to(
          item.value,
          {
            opacity: match.opacity,
          },
          0,
        );
        item.value.normalScale &&
          this.changeConfigTl.to(
            item.value.normalScale,
            {
              x: match.normalScale.x,
              y: match.normalScale.y,
            },
            0,
          );
        this.changeConfigTl.to(
          item.value,
          {
            roughnessMapIntensity: match.roughnessMapIntensity,
          },
          0,
        );
        this.changeConfigTl.to(
          item.value,
          {
            metalnessMapIntensity: match.metalnessMapIntensity,
          },
          0,
        );
      });
    };
    project.state.on(events.CONFIG_CHANGE, this.onConfigChange);
    this.changeConfigTl = null;
    this.configsPerMaterial = project.webgl.scene.materials.map((item) => {
      if (!item.mainValue) return;
      const r = {
        color: item.mainValue.color.clone(),
        roughness: item.mainValue.roughness,
        metalness: item.mainValue.metalness,
        envMapIntensity: item.mainValue.envMapIntensity,
        additiveEnvMapIntensity: item.mainValue.additiveEnvMapIntensity,
        opacity: item.mainValue.opacity,
        normalScale: item.mainValue.normalScale || new Vector2(1, -1),
        metalnessMapIntensity: item.mainValue.metalnessMapIntensity || 1,
        roughnessMapIntensity: item.mainValue.roughnessMapIntensity || 1,
      };
      return {
        value: item.mainValue,
        configs: Object.entries(item.configs).map(([item2, item3]) => ({
          name: item2,
          color: item3.color !== void 0 ? new Color(item3.color) : r.color,
          roughness: item3.roughness !== void 0 ? item3.roughness : r.roughness,
          metalness: item3.metalness !== void 0 ? item3.metalness : r.metalness,
          envMapIntensity:
            item3.envMapIntensity !== void 0
              ? item3.envMapIntensity
              : r.envMapIntensity,
          additiveEnvMapIntensity:
            item3.additiveEnvMapIntensity !== void 0
              ? item3.additiveEnvMapIntensity
              : r.additiveEnvMapIntensity,
          opacity: item3.opacity !== void 0 ? item3.opacity : r.opacity,
          normalScale: Array.isArray(item3.normalScale)
            ? new Vector2(...item3.normalScale)
            : r.normalScale,
          metalnessMapIntensity:
            item3.metalnessMapIntensity !== void 0
              ? item3.metalnessMapIntensity
              : r.metalnessMapIntensity,
          roughnessMapIntensity:
            item3.roughnessMapIntensity !== void 0
              ? item3.roughnessMapIntensity
              : r.roughnessMapIntensity,
        })),
      };
    });
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.watch.position,
      {
        z: 4,
        y: 0,
        x: 0,
      },
      0.01,
    );
    timeline.to(
      project.webgl.postProcessing.material.uniforms.uBackgroundMultiplier,
      {
        value: 0.3,
        ease: 'power3.inOut',
        duration: 0.2,
      },
      0,
    );
    timeline.to(
      project.webgl.postProcessing.material.uniforms.uBackgroundMultiplier,
      {
        value: 1,
        ease: 'power3.inOut',
        duration: 0.2,
      },
      0.8,
    );
    timeline.set(
      this.watch.rotation,
      {
        x: 0,
        y: Math.PI * 0.5,
        z: 0,
      },
      0,
    );
    timeline.to(
      this.camera,
      {
        radius: 10,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.1,
    );
    timeline.to(
      this.watch.position,
      {
        y: 0,
        x: 0,
        z: 0,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.1,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 0.2,
        x: Math.PI * -0.15,
        z: 0,
        duration: 0.15,
        ease: 'power3.out',
      },
      0.15,
    );
    timeline.to(
      this.camera,
      {
        parallaxIntensityMultiplier: 0,
        duration: 0.01,
      },
      0,
    );
    timeline.to(
      this.camera,
      {
        parallaxIntensityMultiplier: 1,
        duration: 0.15,
        ease: 'power3.inOut',
      },
      0.15,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: 0,
        x: 0,
        z: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.to(
      this.camera,
      {
        parallaxIntensityMultiplier: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.set(
      project.webgl.scene.overlayPlane,
      {
        visible: false,
      },
      0.54,
    );
    timeline.set(
      project.webgl.scene.overlayPlane,
      {
        visible: true,
      },
      0.545,
    );
    timeline.to(
      project.webgl.scene.overlayPlane.material.uniforms.uProgress,
      {
        value: 1,
        duration: 0.45,
        ease: 'power1.inOut',
      },
      0.55,
    );
    timeline.set(
      project.webgl.scene.overlayPlane,
      {
        visible: false,
      },
      1,
    );
    timeline.set(
      this.watch,
      {
        visible: false,
      },
      1,
    );
    return timeline;
  }
}
const explosionSettings = {
  gaussianPeakXplod: {
    mobile: 0,
    tablet: 0,
    desktop: 0.013,
  },
  gaussianSpreadXplod: {
    mobile: 0,
    tablet: 0,
    desktop: 0.15,
  },
  gaussianPeakChildren: {
    mobile: 0.025,
    tablet: 0.025,
    desktop: 0.015,
  },
  gaussianSpreadChildren: {
    mobile: 0.4,
    tablet: 0.4,
    desktop: 0.2,
  },
};
const xe = new Vector3();
const gi = new Vector2();
class DisassemblyScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
    this.onLeaveClickedMesh = () => {
      this.clickedIndex = null;
    };
    this.onHover = () => {
      var e, s;
      (s = (e = this.hoverTl) == null ? void 0 : e.kill) == null || s.call(e);
      this.hoverTl = gsap.timeline();
      this.hoveredIndex === null
        ? (this.hoverTl.to(
            project.webgl.scene.disassemblyOverlay.material.uniforms.uProgress,
            {
              value: 0,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ),
          this.hoverTl.to(
            project.webgl.scene.laserBeam.material.uniforms.uOpacityMultiplier,
            {
              value: 1,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ))
        : (this.hoverTl.to(
            project.webgl.scene.disassemblyOverlay.material.uniforms.uProgress,
            {
              value: 1,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ),
          this.hoverTl.to(
            project.webgl.scene.laserBeam.material.uniforms.uOpacityMultiplier,
            {
              value: 0,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ));
    };
    this.onLongpressToggle = (value) => {
      this.onXplodAll(value);
    };
    this.onXplodAll = (value) => {
      var s, n;
      (value && !this.canHover) ||
        ((n = (s = this.xplodAllTl) == null ? void 0 : s.kill) == null ||
          n.call(s),
        (this.xplodAllTl = gsap.timeline()),
        this.xplodAllTl.to(
          project.webgl.scene,
          {
            xplodAllProgress: value ? 1 : 0,
            xplodedPosMultiplier: value ? 1.65 : 1,
            ease: 'power3.inOut',
            duration: value ? 2 : 1,
          },
          0,
        ),
        this.xplodAllTl.to(
          project.webgl.scene.disassemblyOverlay.material.uniforms
            .uOpacityMultiplier,
          {
            value: value ? 0 : 1,
            ease: 'power3.inOut',
            duration: value ? 2 : 1,
          },
          0,
        ),
        project.store.set(
          storeKeys.IS_ALL_XPLODED,
          !project.store.get(storeKeys.IS_ALL_XPLODED),
        ));
    };
    this.zoomOnClicked = () => {
      var e, s, n, r, l;
      (s = (e = this.hoverTl) == null ? void 0 : e.kill) == null || s.call(e);
      (r = (n = this.clickTl) == null ? void 0 : n.kill) == null || r.call(n);
      this.clickTl = gsap.timeline();
      project.store.get(storeKeys.IS_ALL_XPLODED) &&
        project.state.emit(events.XPLOD_ALL, false);
      this.clickedIndex === null
        ? ((this.camera.dragPosition.target.x = 0),
          this.clickTl.to(
            this.xplodMouseIntensity,
            {
              zoom: 1,
              duration: 1.6,
              ease: 'power3.inOut',
            },
            0,
          ),
          this.watchParts.horizontal.forEach((item) => {
            this.clickTl.to(
              item.zoomPos,
              {
                z: 0,
                duration: 1.6,
                ease: 'power3.inOut',
              },
              0,
            );
            this.clickTl.to(
              item,
              {
                zoomProgress: 0,
                duration: 1.6,
                ease: 'power3.inOut',
              },
              0,
            );
          }),
          this.clickTl.to(
            this.camera,
            {
              radiusMultiplier: 1,
              ease: 'power3.inOut',
              duration: 1.6,
            },
            0,
          ),
          this.clickTl.to(
            project.webgl.scene.disassemblyOverlay.material.uniforms
              .uZoomProgress,
            {
              value: 0,
              duration: 1.6,
              ease: 'power3.inOut',
            },
            0,
          ),
          this.clickTl.to(
            project.webgl.scene.disassemblyOverlay.material.uniforms.uProgress,
            {
              value: 0,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ))
        : (this.clickTl.to(
            this.xplodMouseIntensity,
            {
              zoom: 0,
              duration: 2,
              ease: 'power3.inOut',
            },
            0,
          ),
          this.clickTl.to(
            project.webgl.scene.laserBeam.material.uniforms.uOpacityMultiplier,
            {
              value: 0,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ),
          xe.set(0, 0, 0),
          (l = this.watchParts.horizontal[this.clickedIndex]) == null ||
            l.mesh.getWorldPosition(xe),
          (xe.z = 0),
          this.camera.dragPosition.target.copy(xe),
          this.clickTl.to(
            this.camera,
            {
              radiusMultiplier: 0.6,
              ease: 'power3.inOut',
              duration: 2,
            },
            0,
          ),
          this.watchParts.horizontal.forEach((item, index) => {
            const f =
              index == this.clickedIndex
                ? 0
                : (index - this.clickedIndex) * 0.001 +
                  (index < this.clickedIndex ? -0.02 : 0.02);
            this.clickTl.to(
              item.zoomPos,
              {
                z: f,
                duration: 2,
                ease: 'power3.inOut',
              },
              0,
            );
            this.clickTl.to(
              item,
              {
                zoomProgress: index == this.clickedIndex ? 1 : 0,
                duration: 2,
                ease: 'power3.inOut',
              },
              0,
            );
          }),
          this.clickTl.to(
            project.webgl.scene.disassemblyOverlay.material.uniforms
              .uZoomProgress,
            {
              value: 1,
              duration: 2,
              ease: 'power3.inOut',
            },
            0,
          ),
          this.clickTl.to(
            project.webgl.scene.disassemblyOverlay.material.uniforms.uProgress,
            {
              value: 1,
              duration: 0.8,
              ease: 'power3.inOut',
            },
            0,
          ));
    };
    this.onNextPreviousClickedMesh = (value = 1) => {
      const s = this.hoverableIndexes.indexOf(this.clickedIndex);
      if (s === -1) return;
      const n = s + value;
      n < 0 ||
        n >= this.hoverableIndexes.length ||
        (this.clickedIndex = this.hoverableIndexes[n]);
    };
    this.onTick = ({ dt: deltaTime }) => {
      this.watchParts.horizontal.forEach((item, index) => {
        if (item.raycasterMesh) {
          xe.setFromMatrixPosition(item.raycasterMesh.matrixWorld);
          xe.project(this.camera);
          project.state.emit(events.HOVER_POSITION, {
            id: item.raycasterMesh.userData.hover,
            x: xe.x,
            y: xe.y,
          });
          const r =
            (engine.tools.viewport.breakpoint === 'desktop'
              ? project.webgl.globalUniforms.uMouse.value.x
              : 0) - xe.x;
          item.hoverPos.z =
            this.xplodMouseIntensity.scroll *
            this.xplodMouseIntensity.zoom *
            lerp(
              this.gaussianPeakXplod *
                (1 -
                  Math.exp(
                    -Math.pow(r, 2) /
                      (2 * Math.pow(this.gaussianSpreadXplod, 2)),
                  )) *
                Math.sign(r),
              0,
              project.webgl.scene.xplodAllProgress,
            );
          item.xplodRotationMultiplier.y = lerp(
            lerp(
              1,
              1 +
                1 *
                  Math.exp(
                    -Math.pow(r, 2) /
                      (2 * Math.pow(this.gaussianSpreadXplod, 2)),
                  ),
              this.xplodMouseIntensity.zoom,
            ),
            2,
            project.webgl.scene.xplodAllProgress,
          );
          item.xplodedChildren.forEach((item2) => {
            item2.position.z =
              lerp(
                lerp(
                  this.xplodMouseIntensity.scroll *
                    this.xplodMouseIntensity.zoom *
                    this.gaussianPeakChildren *
                    Math.exp(
                      -Math.pow(r, 2) /
                        (2 * Math.pow(this.gaussianSpreadChildren, 2)),
                    ) *
                    item2.userData.xplodRatio,
                  item2.userData.xplodRatio * 0.015,
                  project.webgl.scene.xplodAllProgress,
                ),
                item2.userData.xplodRatio * 0.035,
                (1 - this.xplodMouseIntensity.zoom) *
                  item.zoomProgress *
                  this.xplodMouseIntensity.scroll,
              ) + item2.userData.initialZPos;
          });
        }
      });
      engine.tools.viewport.breakpoint === 'desktop' &&
        ((this.lastHoveredMesh || this.clickedMesh) &&
          (xe.setFromMatrixPosition(
            this.clickedMesh
              ? this.clickedMesh.matrixWorld
              : this.lastHoveredMesh.matrixWorld,
          ),
          xe.project(this.camera),
          (this.overlayXTarget = xe.x)),
        (project.webgl.scene.disassemblyOverlay.material.uniforms.uScreenX.value =
          lerp(
            project.webgl.scene.disassemblyOverlay.material.uniforms.uScreenX
              .value,
            this.overlayXTarget,
            deltaTime * 3,
          )));
      this.clickedMesh
        ? this.clickedMesh.getWorldPosition(xe)
        : xe.set(0, 0, 0);
      project.webgl.camera.lookAtPosition.target = xe;
      this.clickedIndex !== null &&
        this.watchParts.horizontal[this.clickedIndex] &&
        (this.watchParts.horizontal[this.clickedIndex].manipulationRotation.y +=
          deltaTime * 0.15);
    };
    this.raycasterMeshes = [];
    this.hoverableIndexes = [];
    this.watchParts.horizontal.forEach((item, index) => {
      if (item.hover) {
        this.hoverableIndexes.push(index);
        const box3 = new Box3();
        box3.setFromObject(item.mesh);
        const mesh = new Mesh(
          new BoxGeometry(
            box3.max.x - box3.min.x,
            box3.max.y - box3.min.y,
            box3.max.z - box3.min.z,
          ),
          new MeshBasicMaterial({
            visible: false,
          }),
        );
        mesh.userData.hover = item.hover;
        this.raycasterMeshes.push(mesh);
        item.mesh.add(mesh);
        item.raycasterMesh = mesh;
      }
    });
    this.raycaster = new Raycaster();
    this.clickTl = null;
    this.disassemblyRatioTl = null;
    this.horizontalXplodedOriginalPositions = [];
    this.canHover = false;
    this.clickedMesh = null;
    this.overlayXTarget = 0.5;
    this.xplodMouseIntensity = {
      scroll: 0,
      zoom: 1,
    };
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      this.camera.dragPosition,
      {
        intensity: 1,
        duration: 0.5,
        ease: 'power3.inOut',
      },
      0,
    );
    timeline.to(
      this.camera,
      {
        longpressZoomMultiplier: 0.3,
        duration: 0.1,
        ease: 'power3.inOut',
      },
      0,
    );
    timeline.to(
      this.camera,
      {
        longpressZoomMultiplier: 1,
        duration: 0.1,
        ease: 'power3.inOut',
      },
      0.9,
    );
    timeline.to(
      this.camera,
      {
        parallaxIntensityMultiplier: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      },
      0,
    );
    timeline.to(
      this.camera,
      {
        radius: 6,
        duration: 0.75,
        ease: 'power3.inOut',
      },
      0,
    );
    timeline.to(
      this.watchParts.emptyStrap.position,
      {
        z: -0.2,
        duration: 0.5,
        ease: 'power3.in',
      },
      0,
    );
    timeline.set(
      this.watchParts.emptyStrap,
      {
        visible: false,
      },
      0.5,
    );
    timeline.to(
      this.watchParts.emptyXploded.position,
      {
        z: 0,
        duration: 0.75,
        ease: 'power3.inOut',
      },
      0,
    );
    this.watchParts.horizontal.forEach((item, index) => {
      const r = (this.watchParts.horizontal.length + 1) / 2;
      timeline.to(
        item.xplodPos,
        {
          z: (index + 1 - r) * 0.013,
          duration: 0.75,
          ease: 'power3.inOut',
        },
        0,
      );
    });
    timeline.to(
      this.watchParts.glass.position,
      {
        z: 0.15,
        duration: 0.45,
        ease: 'power3.in',
      },
      0,
    );
    timeline.set(
      this.watchParts.glass,
      {
        visible: false,
      },
      0.45,
    );
    this.watchParts.shadowMaterial &&
      timeline.to(
        this.watchParts.shadowMaterial,
        {
          alpha: 0,
          duration: 0.5,
          ease: 'power3.inOut',
        },
        0,
      );
    this.watchParts.horizontal.forEach((item) => {
      timeline.to(
        item.xplodRotation,
        {
          y: Math.PI * 0.1,
          duration: 0.75,
          ease: 'power3.inOut',
        },
        0,
      );
    });
    timeline.set(
      project.webgl.scene.laserBeam,
      {
        visible: false,
      },
      0,
    );
    timeline.set(
      project.webgl.scene.laserBeam,
      {
        visible: true,
      },
      0.01,
    );
    timeline.to(
      project.webgl.scene.laserBeam.material.uniforms.uOpacity,
      {
        value: 1,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.3,
    );
    timeline.set(
      project.webgl.scene.disassemblyOverlay,
      {
        visible: false,
      },
      0,
    );
    timeline.set(
      project.webgl.scene.disassemblyOverlay,
      {
        visible: true,
      },
      0.01,
    );
    timeline.to(
      project.webgl.scene.disassemblyOverlay.material.uniforms.uOpacity,
      {
        value: 1,
        duration: 0.2,
        ease: 'power1.inOut',
      },
      0.2,
    );
    timeline.to(
      project.webgl.scene.disassemblyOverlay.material.uniforms.uOpacity,
      {
        value: 0,
        duration: 0.15,
        ease: 'power1.inOut',
      },
      0.7,
    );
    timeline.set(
      project.webgl.scene.disassemblyOverlay,
      {
        visible: false,
      },
      1,
    );
    this.watchParts.horizontalMaterials.forEach((item) => {
      item.name == 'dial' ||
        item.name == 'white' ||
        item.name == 'white.001' ||
        item.name == '-numbers-nekst' ||
        item.name == 'fs60p' ||
        item.name == 'automaticChronograph' ||
        item.name == 'ruby' ||
        timeline.to(
          item,
          {
            aoMapIntensity: 0,
            duration: 0.5,
            ease: 'power3.inOut',
          },
          0,
        );
    });
    this.watchParts.side.forEach((item, index) => {
      this.horizontalXplodedOriginalPositions.push(item.position.clone());
      item.translateZ(-0.015);
      const clone = item.position.clone();
      item.translateZ(0.015);
      timeline.to(
        item.position,
        {
          x: clone.x,
          y: clone.y,
          z: clone.z,
          duration: 0.5,
          ease: 'power3.inOut',
        },
        0,
      );
    });
    this.watchParts.screws.forEach((item, index) => {
      const r = 0.5 + 0.25 * (index / (this.watchParts.screws.length - 1));
      timeline.to(
        item.rotation,
        {
          y: item.rotation.y - Math.PI * 2,
          duration: 0.1,
          ease: 'power3.inOut',
        },
        0 + 0.05 * (index / (this.watchParts.screws.length - 1)),
      );
      timeline.to(
        item.position,
        {
          z: 0.15 + item.position.z,
          duration: r,
          ease: 'power3.inOut',
        },
        0,
      );
    });
    timeline.to(
      this.camera.dragPosition,
      {
        intensity: 0,
        duration: 0.25,
        ease: 'power3.inOut',
      },
      0.75,
    );
    this.watchParts.horizontal.forEach((item) => {
      item !== this.watchParts.dialXplod &&
        timeline.to(
          item.xplodPos,
          {
            z: 0,
            duration: 0.25,
            ease: 'power3.inOut',
          },
          0.75,
        );
    });
    this.watchParts.horizontal.forEach((item) => {
      timeline.to(
        item.xplodRotation,
        {
          y: 0,
          duration: 0.25,
          ease: 'power3.inOut',
        },
        0.75,
      );
    });
    timeline.to(
      project.webgl.scene.laserBeam.material.uniforms.uOpacity,
      {
        value: 0,
        duration: 0.3,
        ease: 'power3.inOut',
      },
      0.7,
    );
    timeline.set(
      project.webgl.scene.laserBeam,
      {
        visible: true,
      },
      0.9,
    );
    timeline.set(
      project.webgl.scene.laserBeam,
      {
        visible: false,
      },
      0.91,
    );
    timeline.to(
      this.watchParts.emptyXploded.position,
      {
        z: 0,
        duration: 0.25,
        ease: 'power3.inOut',
      },
      0.75,
    );
    timeline.to(
      this.watchParts.dialXplod.dialXplodPos,
      {
        z: 0.2,
        duration: 0.2,
        ease: 'power3.in',
      },
      0.75,
    );
    timeline.set(
      this.watchParts.dialXplod.mesh,
      {
        visible: false,
      },
      1,
    );
    timeline.set(
      this.watchParts.dialXplod.xplodPos,
      {
        z: 0,
      },
      1,
    );
    this.watchParts.dialXplod.xplodedChildren.forEach((item, index) => {
      timeline.to(
        item.position,
        {
          z: item.userData.initialZPos + index * 0.01 + 0.03,
          duration: 0.25,
          ease: 'power3.inOut',
        },
        0.75,
      );
    });
    timeline.add(() => {
      project.store.get(storeKeys.IS_ALL_XPLODED) &&
        project.state.emit(events.XPLOD_ALL, false);
    }, 0.45);
    timeline.add(() => {
      project.store.get(storeKeys.IS_ALL_XPLODED) &&
        project.state.emit(events.XPLOD_ALL, false);
    }, 0.8);
    timeline.add(() => {
      this.clickedIndex = null;
      this.hoveredIndex = null;
      project.state.emit(events.SET_CURSOR_ICON, '');
    }, 0.45);
    timeline.add(() => {
      this.clickedIndex = null;
      this.hoveredIndex = null;
    }, 0.8);
    timeline.to(
      this.xplodMouseIntensity,
      {
        scroll: 1,
        duration: 0.1,
      },
      0.45,
    );
    timeline.to(
      this.xplodMouseIntensity,
      {
        scroll: 0,
        duration: 0.1,
      },
      0.7,
    );
    timeline.set(
      this,
      {
        canHover: false,
      },
      0.44,
    );
    timeline.set(
      this,
      {
        canHover: true,
      },
      0.45,
    );
    timeline.set(
      this,
      {
        canHover: false,
      },
      0.8,
    );
    timeline.set(
      this.camera.dragPosition,
      {
        canDrag: true,
      },
      0.45,
    );
    timeline.set(
      this.camera.dragPosition,
      {
        canDrag: false,
      },
      0.8,
    );
    timeline.set(
      this.camera.dragPosition.target,
      {
        x: 0,
      },
      0.8,
    );
    return timeline;
  }
  set hoveredIndex(hoveredIndexValue) {
    var s;
    hoveredIndexValue === null &&
      this.canHover &&
      project.state.emit(events.SET_CURSOR_ICON, 'hold');
    this.hoveredIndexValue !== hoveredIndexValue &&
      ((this.hoveredIndexValue = hoveredIndexValue),
      (engine.$app.style.cursor = hoveredIndexValue === null ? '' : 'pointer'),
      project.state.emit(
        events.SET_CURSOR_ICON,
        hoveredIndexValue === null ? (this.canHover ? 'hold' : '') : 'plus',
      ),
      (this.hoveredMesh =
        (s = this.watchParts.horizontal.find(
          (item, index) => index == hoveredIndexValue,
        )) == null
          ? void 0
          : s.mesh),
      this.hoveredMesh && (this.lastHoveredMesh = this.hoveredMesh),
      this.clickedIndex === null && this.onHover());
  }
  get hoveredIndex() {
    return this.hoveredIndexValue;
  }
  nearestSmallerMultipleOfTwoPi(value) {
    const s = Math.PI * 2;
    return Math.floor(value / s) * s;
  }
  set clickedIndex(clickedIndexValue) {
    var s, n, r;
    this.clickedIndexValue !== clickedIndexValue &&
      ((project.webgl.globalUniforms.clickedIndex.value = clickedIndexValue),
      (this.oldClickedIndex = this.clickedIndexValue),
      (this.clickedIndexValue = clickedIndexValue),
      (this.clickedMesh =
        ((s = this.watchParts.horizontal.find(
          (item, index) => index == clickedIndexValue,
        )) == null
          ? void 0
          : s.mesh) || null),
      project.state.emit(
        events.SET_CLICKED_MESH,
        ((r = (n = this.clickedMesh) == null ? void 0 : n.userData) == null
          ? void 0
          : r.hover) || null,
      ),
      this.watchParts.horizontal[this.oldClickedIndex] &&
        gsap.to(
          this.watchParts.horizontal[this.oldClickedIndex].manipulationRotation,
          {
            y: this.nearestSmallerMultipleOfTwoPi(
              this.watchParts.horizontal[this.oldClickedIndex]
                .manipulationRotation.y,
            ),
            ease: 'power3.inOut',
            duration: 1.6,
          },
        ),
      this.zoomOnClicked());
  }
  get clickedIndex() {
    return this.clickedIndexValue;
  }
  onPointerMove({ webgl: value }) {
    if (!this.canHover || project.webgl.scene.xplodAllProgress) {
      this.hoveredIndex = this.tmpMobileHoveredIndex = null;
      return;
    }
    if (this.clickedIndex !== null) return;
    this.raycaster.setFromCamera(value, this.camera);
    const s = this.raycaster.intersectObjects(this.raycasterMeshes);
    if (s.length) {
      const hoveredIndex = this.watchParts.horizontal.indexOf(
        this.watchParts.horizontal.find(
          (item) => s[0].object.parent.name == item.name,
        ),
      );
      engine.tools.viewport.breakpoint === 'desktop'
        ? (this.hoveredIndex = hoveredIndex)
        : (this.tmpMobileHoveredIndex = hoveredIndex);
    } else this.hoveredIndex = this.tmpMobileHoveredIndex = null;
  }
  onPointerDown({ webgl: value, dom: value2 }) {
    this.clickedIndex === null &&
      (this.onPointerMove({
        webgl: value,
      }),
      (this._tmpHoveredIndex = this.hoveredIndex),
      gi.copy(value2));
  }
  onPointerUp({ dom: value }) {
    if (
      this.clickedIndex === null &&
      (engine.tools.viewport.breakpoint == 'desktop' &&
        this.hoveredIndex == this._tmpHoveredIndex &&
        (this.clickedIndex = this.hoveredIndex),
      engine.tools.viewport.breakpoint !== 'desktop' &&
        this.tmpMobileHoveredIndex !== null &&
        gi.distanceTo(value) < 15)
    ) {
      this.clickedIndex = this.tmpMobileHoveredIndex;
      return;
    }
  }
  enterCenter() {
    super.enterCenter();
  }
  leaveCenter() {
    super.leaveCenter();
    project.state.emit(events.SET_CURSOR_ICON, null);
  }
  resize() {
    super.resize();
    this.gaussianPeakXplod =
      explosionSettings.gaussianPeakXplod[engine.tools.viewport.breakpoint];
    this.gaussianSpreadXplod =
      explosionSettings.gaussianSpreadXplod[engine.tools.viewport.breakpoint];
    this.gaussianPeakChildren =
      explosionSettings.gaussianPeakChildren[engine.tools.viewport.breakpoint];
    this.gaussianSpreadChildren =
      explosionSettings.gaussianSpreadChildren[
        engine.tools.viewport.breakpoint
      ];
  }
}
new Vector3();
const pointerDownPosition = new Vector2();
class FooterScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
    this.onTick = ({ dt: deltaTime }) => {
      engine.tools.viewport.breakpoint === 'desktop' &&
        (project.webgl.scene.watchesGroup.intersectPoint.value.lerp(
          project.webgl.scene.watchesGroup.intersectPoint.target,
          5 * deltaTime,
        ),
        project.webgl.scene.watchesGroup.watchesInsideGroup.children.forEach(
          (item) => {
            item.children[0].lookAt(
              project.webgl.scene.watchesGroup.intersectPoint.value,
            );
          },
        ));
    };
    this.onPointerMove = ({ webgl: value }) => {
      project.webgl.scene.watchesGroup.raycaster.setFromCamera(
        value,
        project.webgl.camera,
      );
      project.webgl.scene.watchesGroup.raycaster.ray.intersectPlane(
        project.webgl.scene.watchesGroup.plane,
        project.webgl.scene.watchesGroup.intersectPoint.target,
      );
      const s = project.webgl.scene.watchesGroup.raycaster.intersectObjects(
        project.webgl.scene.watchesGroup.raycasterMeshes,
      );
      this.hoveredWatch = s.length ? s[0].object.parent : null;
      this.hoveredConfigName = s.length ? s[0].object.userData.watch : null;
    };
    this.onPointerDown = () => {
      this.onPointerMove({
        webgl: engine.tools.mouse.coordinates.webgl,
      });
      this._tmpHoveredWatch = this.hoveredWatch;
      pointerDownPosition.copy(engine.tools.mouse.coordinates.dom);
    };
    this.onPointerUp = () => {
      var e, s;
      if (
        (this.onPointerMove({
          webgl: engine.tools.mouse.coordinates.webgl,
        }),
        !(
          this.hoveredWatchValue !== this.hoveredWatch ||
          this.hoveredWatchValue === null
        ) &&
          !(
            pointerDownPosition.distanceTo(engine.tools.mouse.coordinates.dom) >
            15
          ) &&
          this.hoveredConfigName &&
          project.store.get(storeKeys.CURRENT_CONFIG) !==
            this.hoveredConfigName)
      ) {
        project.state.emit(events.SET_CURSOR_ICON, null);
        const n = this.hoveredConfigName;
        (s = (e = this.changeConfigTl) == null ? void 0 : e.kill) == null ||
          s.call(e);
        this.changeConfigTl = gsap.timeline();
        this.changeConfigTl.set(
          this.transitionOverlay,
          {
            display: 'flex',
          },
          0,
        );
        this.changeConfigTl.fromTo(
          this.transitionOverlay,
          {
            y: 0,
          },
          {
            y: '-200vh',
            ease: 'power4.out',
            duration: 1,
          },
        );
        this.changeConfigTl.fromTo(
          this.transitionTextSplit.chars,
          {
            y: '200%',
          },
          {
            y: 0,
            stagger: {
              from: 'start',
              each: 0.07,
            },
            duration: 1,
            ease: 'power3.out',
          },
          0,
        );
        this.changeConfigTl.add(() => {
          var r;
          project.state.emit(events.CONFIG_CHANGE, {
            configName: n,
            duration: 0,
          });
          (r = project.dom.lenis) == null ||
            r.scrollTo(0, {
              immediate: true,
              onComplete: () => {
                setTimeout(() => {
                  var l, c;
                  project.webgl.sectionsController.currentScroll =
                    project.webgl.sectionsController.currentDOMScroll = 0;
                  (c =
                    (l = project.webgl) == null
                      ? void 0
                      : l.sectionsController.sections) == null ||
                    c.forEach((item) => {
                      item.name === 'Disassembly' &&
                        ((item.xplodMouseIntensity.scroll = 0),
                        (item.xplodMouseIntensity.zoom = 1),
                        item.onTick({
                          dt: 0.16,
                        }));
                    });
                }, 200);
              },
            });
        });
        this.changeConfigTl.to(
          project.webgl.sectionsController,
          {
            scrollDampMultiply: 5,
            duration: 0.5,
          },
          0,
        );
        this.changeConfigTl.to(
          project.webgl.sectionsController,
          {
            scrollDampMultiply: 1,
            duration: 0.5,
          },
          1.5,
        );
        this.changeConfigTl.to(
          this.transitionOverlay,
          {
            y: '-400vh',
            ease: 'power4.in',
            duration: 1,
          },
          1.5,
        );
        this.changeConfigTl.to(
          this.transitionTextSplit.chars,
          {
            y: '-300%',
            stagger: {
              from: 'start',
              each: 0.04,
            },
            duration: 1,
            ease: 'power2.in',
          },
          1.5,
        );
        this.changeConfigTl.set(this.transitionOverlay, {
          display: 'none',
        });
      }
    };
    this.enter = () => {
      super.enter();
      this.onPointerMove({
        webgl: engine.tools.mouse.coordinates.webgl,
      });
      project.state.emit(events.SET_CURSOR_ICON, 'select');
    };
    this.leave = () => {
      super.leave();
      this.hoveredWatch = null;
      project.state.emit(events.SET_CURSOR_ICON, null);
    };
    this.transitionOverlay = engine.$app.querySelector('#transition-overlay');
    this.transitionText = this.transitionOverlay.querySelector('p');
    this.transitionTextSplit = new SplitText(this.transitionText, {
      type: 'chars',
    });
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      project.webgl.scene.watchesGroup,
      {
        visible: false,
      },
      0,
    );
    timeline.set(
      project.webgl.scene.watchesGroup,
      {
        visible: true,
      },
      0.01,
    );
    const s = engine.tools.viewport.breakpoint !== 'desktop';
    project.webgl.scene.watchesGroup.watchesInsideGroup.children.forEach(
      (item, index) => {
        timeline.from(
          item.position,
          {
            y: s ? -7 : -3.5,
            duration: 0.7 + index * 0.1,
            ease: 'power4.out',
          },
          0,
        );
      },
    );
    return timeline;
  }
  set hoveredWatch(hoveredWatchValue) {
    var s, n;
    hoveredWatchValue !== this.hoveredWatchValue &&
      (project.state.emit(
        events.SET_CURSOR_ICON,
        hoveredWatchValue ? 'top-right-arrow' : 'select',
      ),
      (this.hoveredWatchValue = hoveredWatchValue),
      (engine.$app.style.cursor = hoveredWatchValue ? 'pointer' : ''),
      (n = (s = this.hoverTl) == null ? void 0 : s.kill) == null || n.call(s),
      (this.hoverTl = gsap.timeline()));
  }
  get hoveredWatch() {
    return this.hoveredWatchValue;
  }
}
class ImagesScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
  }
}
class IntroScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
    this.openAnimation = () => {
      const timeline = gsap.timeline({
        delay: 0.5,
      });
      timeline.to(document.querySelector('#loader div'), {
        opacity: 0,
        ease: 'none',
        duration: 0.4,
      });
      timeline.to(document.querySelector('#loader'), {
        opacity: 0,
        display: 'none',
        ease: 'power1.in',
        duration: 1.2,
      });
      timeline.from(
        this.watchWrapper.position,
        {
          z: 10,
          duration: 2,
          ease: 'power3.out',
        },
        '>-=1',
      );
      timeline.from(
        this.watchWrapper.rotation,
        {
          x: Math.PI * -0.3,
          y: Math.PI * 0.45,
          z: 0,
          duration: 2,
          ease: 'power3.out',
        },
        '<',
      );
      timeline.to(
        project.webgl.camera,
        {
          parallaxIntensityOpen: 1,
          ease: 'power3.inOut',
        },
        '<+=0.5',
      );
    };
    project.state.on(events.OPEN_PROJECT, this.openAnimation);
    this.watchWrapper = new Object3D();
    const n = this.watch.parent;
    this.watch.removeFromParent();
    this.watchWrapper.add(this.watch);
    n.add(this.watchWrapper);
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 0.2,
        x: Math.PI * -0.15,
        duration: 0.1,
        ease: 'power1.inOut',
      },
      0,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 2,
        x: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      },
      0.1,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 1.55,
        duration: 0.5,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.to(
      project.webgl.scene,
      {
        rotorRotationMultiplier: 0,
        ease: 'power3.inOut',
        duration: 0.15,
      },
      0.75,
    );
    return timeline;
  }
}
const origin = new Vector3(0, 0, 0);
class MechanismScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
    this.onPointerMove = ({ webgl: value }) => {
      this.pointerPos.target.copy(value);
    };
    this.onTick = ({ dt: deltaTime, et: elapsedTime }) => {
      this.pointerPos.value.lerp(this.pointerPos.target, deltaTime * 1);
      project.webgl.particlesCamera.position.y =
        -this.pointerPos.value.y * 0.4 + Math.sin(elapsedTime * 0.5) * 0.5;
      project.webgl.particlesCamera.position.x =
        -this.pointerPos.value.x * 0.4 + Math.cos(elapsedTime * 0.5) * 0.5;
      project.webgl.particlesCamera.lookAt(origin);
      project.webgl.particlesScene.particles.material.uniforms.uMouse.value.copy(
        this.pointerPos.value,
      );
    };
    this.pointerPos = {
      value: new Vector2(),
      target: new Vector2(),
    };
    this.cursor = {
      target: new Vector2(),
      value: new Vector2(),
    };
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      project.webgl.postProcessing.material.uniforms.uBackgroundMultiplier,
      {
        value: 0.3,
        ease: 'power3.inOut',
        duration: 0.1,
      },
      0,
    );
    timeline.to(
      project.webgl.postProcessing.material.uniforms.uBackgroundMultiplier,
      {
        value: 1,
        ease: 'power3.inOut',
        duration: 0.1,
      },
      0.9,
    );
    timeline.set(
      project.webgl.particlesScene,
      {
        visible: false,
      },
      0,
    );
    timeline.set(
      project.webgl.particlesScene,
      {
        visible: true,
      },
      0.001,
    );
    timeline.set(
      project.webgl.particlesScene,
      {
        visible: false,
      },
      1,
    );
    engine.tools.viewport.breakpoint !== 'desktop' &&
      (timeline.to(
        this.watch.position,
        {
          x: 0.25,
          duration: 0.1,
          ease: 'power3.inOut',
        },
        0,
      ),
      timeline.to(
        this.watch.position,
        {
          x: 0,
          duration: 0.2,
          ease: 'power3.inOut',
        },
        0.4,
      ));
    timeline.to(
      [
        project.webgl.particlesScene.particles.material.uniforms.uOpacity,
        project.webgl.particlesScene.particlesPlane.material.uniforms.uOpacity,
      ],
      {
        value: 1,
        duration: 0.1,
      },
      0,
    );
    timeline.to(
      [
        project.webgl.particlesScene.particles.material.uniforms.uProgress,
        project.webgl.particlesScene.particlesPlane.material.uniforms.uProgress,
      ],
      {
        value: 1,
        duration: 1,
        ease: 'linear',
      },
      0,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 1.9,
        duration: 0.15,
        ease: 'power3.inOut',
      },
      0,
    );
    timeline.to(
      this.watch.rotation,
      {
        x: -Math.PI * 0.2,
        duration: 0.3,
        ease: 'power3.inOut',
      },
      0,
    );
    timeline.to(
      project.webgl.scene.globalEnvmapEuler,
      {
        x: Math.PI * 0.5,
        duration: 0.2,
        ease: 'power2.inOut',
        onUpdate: () => project.webgl.scene.updateEnvmapRotationMatrix(),
      },
      0,
    );
    timeline.to(
      project.webgl.scene.globalEnvmapEuler,
      {
        x: Math.PI * 0.7,
        duration: 0.1,
        ease: 'power2.inOut',
        onUpdate: () => project.webgl.scene.updateEnvmapRotationMatrix(),
      },
      0.35,
    );
    timeline.to(
      project.webgl.scene.globalEnvmapEuler,
      {
        x: 0,
        duration: 0.2,
        ease: 'power2.inOut',
        onUpdate: () => project.webgl.scene.updateEnvmapRotationMatrix(),
      },
      0.55,
    );
    this.watchParts.horizontalMaterials.forEach((material) => {
      var n;
      (n = material.uniforms) != null &&
        n.uInvertProgress &&
        (timeline.to(
          material.uniforms.uInvertProgress,
          {
            value: 1,
            duration: 0.1,
            ease: 'power3.inOut',
          },
          0.1,
        ),
        timeline.to(
          material.uniforms.uInvertProgress,
          {
            value: 0,
            duration: 0.1,
            ease: 'power3.inOut',
          },
          0.45,
        ));
    });
    timeline.to(
      project.webgl.globalUniforms.uDarknessProgress,
      {
        value: 1,
        ease: 'power3.inOut',
        duration: 0.1,
      },
      0.55,
    );
    timeline.to(
      project.webgl.globalUniforms.uDarknessProgress,
      {
        value: 0,
        ease: 'power3.inOut',
        duration: 0.1,
      },
      0.75,
    );
    timeline.to(
      this.camera,
      {
        parallaxIntensityMultiplier: 1,
        duration: 0.05,
        ease: 'power3.inOut',
      },
      0.15,
    );
    timeline.to(
      this.camera,
      {
        parallaxIntensityMultiplier: 0,
        duration: 0.15,
        ease: 'power3.inOut',
      },
      0.3,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 2,
        x: -Math.PI * 0.3,
        duration: 0.15,
        ease: 'power3.inOut',
      },
      0.3,
    );
    timeline.to(
      project.webgl.particlesCamera.position,
      {
        z: 0.1,
        duration: 0.4,
        ease: 'power2.in',
      },
      0.45,
    );
    timeline.set(
      this.watchParts.dialXplod.dialXplodPos,
      {
        z: 0,
      },
      0.45,
    );
    timeline.set(
      this.watchParts.dialXplod.mesh,
      {
        visible: true,
      },
      0.45,
    );
    timeline.to(
      this.watch.position,
      {
        y: -0.5,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.45,
    );
    timeline.to(
      this.camera,
      {
        radius: 9,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.45,
    );
    timeline.to(
      this.watchParts.emptyXploded.position,
      {
        z: this.watchParts.emptyXploded.position.z,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.45,
    );
    timeline.set(
      this.watchParts.glass,
      {
        visible: true,
      },
      0.45,
    );
    timeline.to(
      this.watchParts.glass.position,
      {
        z: this.watchParts.glass.position.z,
        duration: 0.25,
        ease: 'power3.out',
      },
      0.45,
    );
    this.watchParts.dialXplod.xplodedChildren.forEach((item, index) => {
      timeline.set(
        item.position,
        {
          z: item.userData.initialZPos + 0.1 + index * 0.05,
        },
        0.44,
      );
      timeline.to(
        item.position,
        {
          z: item.userData.initialZPos,
          duration: 0.2,
          ease: 'power3.out',
        },
        0.45,
      );
    });
    this.watchParts.horizontalMaterials.forEach((item) => {
      timeline.to(
        item,
        {
          aoMapIntensity: 1,
          duration: 0.13,
          ease: 'power3.out',
        },
        0.55,
      );
    });
    this.watchParts.shadowMaterial &&
      timeline.to(
        this.watchParts.shadowMaterial,
        {
          alpha: 1,
          duration: 0.13,
          ease: 'power3.out',
        },
        0.55,
      );
    timeline.set(
      this.watchParts.emptyStrap,
      {
        visible: true,
      },
      0.45,
    );
    timeline.to(
      this.watchParts.emptyStrap.position,
      {
        z: 0,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.45,
    );
    this.watchParts.side.forEach((item, index) => {
      timeline.to(
        item.position,
        {
          x: item.position.x,
          y: item.position.y,
          z: item.position.z,
          duration: 0.3,
          ease: 'power3.inOut',
        },
        0.45,
      );
    });
    this.watchParts.screws.forEach((item, index) => {
      const r = 0.2 + 0.1 * (index / (this.watchParts.screws.length - 1));
      timeline.to(
        item.position,
        {
          z: item.position.z,
          duration: r,
          ease: 'power2.out',
        },
        0.45,
      );
      timeline.to(
        item.rotation,
        {
          y: item.rotation.y,
          duration: 0.1,
          ease: 'power3.inOut',
        },
        0.45 + r - 0.06,
      );
    });
    timeline.to(
      this.watch.rotation,
      {
        x: 0,
        duration: 0.15,
        ease: 'power3.inOut',
      },
      0.65,
    );
    timeline.to(
      this.watch.position,
      {
        y: 0,
        duration: 0.15,
        ease: 'power3.inOut',
      },
      0.65,
    );
    timeline.to(
      this.watch.rotation,
      {
        x: -Math.PI * 0.3,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.8,
    );
    timeline.to(
      this.watch.position,
      {
        y: -1.1,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.8,
    );
    timeline.to(
      this.camera,
      {
        radius: 5.5,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.8,
    );
    timeline.to(
      project.webgl.scene,
      {
        yTranslateAspectIntensity: 1.2,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      '<',
    );
    timeline.to(
      [
        project.webgl.particlesScene.particles.material.uniforms.uOpacity,
        project.webgl.particlesScene.particlesPlane.material.uniforms.uOpacity,
      ],
      {
        value: 0,
        duration: 0.1,
      },
      0.75,
    );
    return timeline;
  }
}
class PartsScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
  }
}
class PresentationScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      project.webgl.scene.globalEnvmapEuler,
      {
        x: -Math.PI * 0.15,
        duration: 0.05,
        ease: 'power2.out',
        onUpdate: () => project.webgl.scene.updateEnvmapRotationMatrix(),
      },
      0,
    );
    timeline.to(
      project.webgl.scene.globalEnvmapEuler,
      {
        x: 0,
        duration: 0.2,
        ease: 'power2.inOut',
        onUpdate: () => project.webgl.scene.updateEnvmapRotationMatrix(),
      },
      0.25,
    );
    timeline.to(
      this.watch.rotation,
      {
        y: Math.PI * 2,
        x: 0,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.25,
    );
    timeline.to(
      this.watch.position,
      {
        y: 0,
        x: 0.6,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.25,
    );
    timeline.to(
      project.webgl.scene,
      {
        yTranslateAspectIntensity: 0,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      '<',
    );
    timeline.to(
      this.watch.position,
      {
        y: -1.15,
        x: 0,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.to(
      project.webgl.scene,
      {
        yTranslateAspectIntensity: 1.5,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      '<',
    );
    timeline.to(
      this.watch.rotation,
      {
        z: Math.PI * -0.5,
        x: Math.PI * -0.6,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.to(
      this.camera,
      {
        radius: 4,
        duration: 0.2,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.to(
      this.watchParts.crown.rotation,
      {
        x: -Math.PI * 2,
        duration: 0.3,
        ease: 'power3.inOut',
      },
      0.5,
    );
    timeline.to(
      this.watch.position,
      {
        z: 3.8,
        x: 0,
        y: -1.25,
        duration: 0.25,
        ease: 'power3.inOut',
      },
      0.7,
    );
    timeline.to(
      project.webgl.scene,
      {
        yTranslateAspectIntensity: 0,
        duration: 0.25,
        ease: 'power3.inOut',
      },
      '<',
    );
    timeline.to(
      this.watch.rotation,
      {
        x: Math.PI * -0.35,
        duration: 0.25,
        ease: 'power3.inOut',
      },
      0.7,
    );
    timeline.set(
      this.watch.position,
      {
        z: 3.8,
        y: 0,
      },
      0.95,
    );
    timeline.set(
      this.watch.rotation,
      {
        z: Math.PI * -0.5,
        x: Math.PI * -0.5,
        y: Math.PI * 2,
      },
      0.95,
    );
    timeline.set(
      this.camera,
      {
        radius: 4,
      },
      0.95,
    );
    return timeline;
  }
}
const braceletEnterStart = 0;
const braceletExitStart = 0.6;
const braceletEnterDuration = 0.4;
const braceletExitDuration = 0.3;
const ns = 20;
const wi = 40;
const it = new Object3D();
new Vector3();
class BraceletScene extends WebGLSection {
  constructor(options, options2) {
    super(options, options2);
    this.onTick = ({ et: elapsedTime, dt: deltaTime }) => {
      this.progressWebgl <= 0 ||
        this.progressWebgl >= 1 ||
        this._updateMatrices();
    };
    const mesh = project.assetsManager
        .get('model')
        .getObjectByName('single-link'),
      mesh2 = project.assetsManager
        .get('model')
        .getObjectByName('single-central-link');
    this.linkMesh = new InstancedMesh(mesh.geometry, mesh.material, ns);
    this.centralMesh = new InstancedMesh(mesh2.geometry, mesh2.material, ns);
    this.linkMesh.scale.setScalar(wi);
    this.centralMesh.scale.setScalar(wi);
    this.linkMesh.visible = this.centralMesh.visible = false;
    project.webgl.scene.add(this.linkMesh, this.centralMesh);
    applyMaterials(
      this.linkMesh,
      materialTypes,
      materialConfig.materials,
      'TheWatchMaterial',
      false,
    );
    applyMaterials(
      this.centralMesh,
      materialTypes,
      materialConfig.materials,
      'TheWatchMaterial',
      false,
    );
    this.instances = this._buildInstances();
    this._updateMatrices();
    this.hoverIntensity = 0;
    engine.currentProject.webgl.scene.materials.forEach((item) => {
      item.name == 'single-metal-brushed'
        ? (item.mainValue = this.linkMesh.material)
        : item.name == 'single-metal-glossy' &&
          (item.mainValue = this.centralMesh.material);
    });
  }
  _buildInstances() {
    const e = (ns + 1) / 2;
    return Array.from(
      {
        length: ns,
      },
      (value, value2) => {
        const r = 0 - (value2 - e) * 0.0058,
          l = 0.0029 - (value2 - e) * 0.0058,
          c = value2 * Math.PI * 0.05;
        return {
          scrollPos: new Vector3(r * 6, 0, 0),
          scrollPosCenter: new Vector3(l * 6, 0, 0),
          rotX: {
            value: c,
          },
          rotXCenter: {
            value: c,
          },
          hoverPos: new Vector3(),
          hoverPosCenter: new Vector3(),
          singlePosX: r,
          singlePosXCenter: l,
          singleOffsetRotation: c,
          originX: 0,
          originY: engine.tools.viewport.breakpoint !== 'mobile' ? -0.004 : 0,
          originZ: 0.1,
          additionalY: 0.01,
        };
      },
    );
  }
  _updateMatrices() {
    this.instances.forEach((item, index) => {
      it.position.set(
        item.scrollPos.x + item.hoverPos.x,
        item.originY + item.additionalY,
        item.originZ,
      );
      it.rotation.set(item.rotX.value, 0, 0);
      it.updateMatrix();
      this.linkMesh.setMatrixAt(index, it.matrix);
      it.position.set(
        item.scrollPosCenter.x + item.hoverPosCenter.x,
        item.originY + item.additionalY,
        item.originZ,
      );
      it.rotation.set(item.rotXCenter.value, 0, 0);
      it.updateMatrix();
      this.centralMesh.setMatrixAt(index, it.matrix);
    });
    this.linkMesh.instanceMatrix.needsUpdate = true;
    this.centralMesh.instanceMatrix.needsUpdate = true;
  }
  braceletTl(timeline) {
    timeline.to(
      [this.linkMesh, this.centralMesh],
      {
        visible: true,
        duration: 0.05,
      },
      0,
    );
    this.instances.forEach((item, index) => {
      timeline.to(
        item.scrollPos,
        {
          x: item.singlePosX,
          duration: braceletEnterDuration,
          ease: 'power2.out',
        },
        braceletEnterStart,
      );
      timeline.to(
        item,
        {
          additionalY:
            engine.tools.viewport.breakpoint == 'mobile' ? -0.005 : -0.002,
          duration: braceletEnterDuration,
          ease: 'power2.out',
        },
        braceletEnterStart,
      );
      timeline.to(
        item,
        {
          originZ: 0,
          duration: braceletEnterDuration,
          ease: 'power2.out',
        },
        braceletEnterStart,
      );
      timeline.to(
        item.rotX,
        {
          value: 0,
          duration: braceletEnterDuration,
          ease: 'power2.out',
        },
        braceletEnterStart,
      );
      timeline.to(
        item.rotXCenter,
        {
          value: 0,
          duration: braceletEnterDuration,
          ease: 'power2.out',
        },
        braceletEnterStart,
      );
      timeline.to(
        item.scrollPosCenter,
        {
          x: item.singlePosXCenter,
          duration: braceletEnterDuration,
          ease: 'power2.out',
        },
        braceletEnterStart,
      );
      timeline.to(
        item.scrollPos,
        {
          x: item.singlePosX * 6,
          duration: braceletExitDuration,
          ease: 'power2.in',
        },
        braceletExitStart,
      );
      timeline.to(
        item.rotX,
        {
          value: -item.singleOffsetRotation,
          duration: braceletExitDuration,
          ease: 'power2.in',
        },
        braceletExitStart,
      );
      timeline.to(
        item.scrollPosCenter,
        {
          x: item.singlePosXCenter * 6,
          duration: braceletExitDuration,
          ease: 'power2.in',
        },
        braceletExitStart,
      );
      timeline.to(
        item.rotXCenter,
        {
          value: -item.singleOffsetRotation,
          duration: braceletExitDuration,
          ease: 'power2.in',
        },
        braceletExitStart,
      );
      timeline.to(
        item,
        {
          originZ: item.originZ,
          duration: braceletExitDuration,
          ease: 'power2.in',
        },
        braceletExitStart,
      );
      timeline.to(
        item,
        {
          additionalY: -item.additionalY,
          duration: braceletExitDuration,
          ease: 'power2.in',
        },
        braceletExitStart,
      );
    });
    timeline.to(
      this,
      {
        hoverIntensity: 1,
        duration: braceletEnterDuration,
        ease: 'power2.in',
      },
      braceletEnterStart,
    );
    timeline.to(
      this,
      {
        hoverIntensity: 0,
        duration: braceletExitDuration,
        ease: 'power2.in',
      },
      braceletExitStart,
    );
    timeline.to(
      [this.linkMesh, this.centralMesh],
      {
        visible: false,
        duration: 0.05,
      },
      1 - 0.05,
    );
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    this.braceletTl(timeline);
    return timeline;
  }
  resize() {
    super.resize();
  }
}
const webglSections = Object.freeze({
  Colors: ColorsScene,
  Disassembly: DisassemblyScene,
  Footer: FooterScene,
  Images: ImagesScene,
  Intro: IntroScene,
  Particles: MechanismScene,
  Parts: PartsScene,
  Presentation: PresentationScene,
  Straps: BraceletScene,
});
export { webglSections };
