import {
  events,
  storeKeys,
  finishKeys,
  explosionScales,
  initialPartRotations,
} from './config';
import {
  DisassemblyOverlayMaterial,
  LaserMaterial,
  OverlayMaterial,
  ParticlesMaterial,
  ParticlesPlaneMaterial,
  PostProcessingMaterial,
  materialTypes,
  materialConfig,
} from './materials';
import {
  Euler,
  Vector3,
  PerspectiveCamera,
  Vector2,
  Matrix3,
  Matrix4,
  Group,
  Plane,
  Raycaster,
  Box3,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Object3D,
  Scene,
  PlaneGeometry,
  BufferGeometry,
  BufferAttribute,
  Points,
  RepeatWrapping,
  WebGLRenderTarget,
  SRGBColorSpace,
  Float32BufferAttribute,
  OrthographicCamera,
} from 'three';
import { engine, engineEvents, globalUniforms, project } from '../engine';
import { environmentMap, applyMaterials } from '../materials/helpers';
const configurableMaterials = [
  'metal-brushed-ext',
  'metal-glossy-ext',
  'single-metal-brushed',
  'single-metal-glossy',
];
class WatchVariants extends Group {
  constructor() {
    super();
    this.addWatches = () => {
      this.watchesInsideGroup = new Group();
      finishKeys.forEach((item, index) => {
        const clone = project.assetsManager
            .get('model')
            .getObjectByName('theWatch')
            .clone(),
          r = [],
          l = [];
        if (
          (clone.traverse((mesh2) => {
            if (
              mesh2.material &&
              configurableMaterials.includes(mesh2.material.name)
            ) {
              if (r.includes(mesh2.material.name)) return;
              mesh2.material = mesh2.material.clone();
              mesh2.material.name = item + mesh2.material.name;
              r.push(mesh2.material.name);
            }
          }),
          l.forEach((item2) => item2.removeFromParent()),
          engine.tools.viewport.breakpoint == 'mobile')
        ) {
          const m = [
            {
              x: -0.6,
              y: 0.9,
            },
            {
              x: 0.6,
              y: 0.9,
            },
            {
              x: -0.6,
              y: -0.9,
            },
            {
              x: 0.6,
              y: -0.9,
            },
          ][index];
          m && ((clone.position.x = m.x), (clone.position.y = m.y - 0.5));
        } else clone.position.x = (index - finishKeys.length / 2) * 1.5 + 0.75;
        const box3 = new Box3();
        box3.setFromObject(clone);
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
        mesh.userData.watch = item;
        this.raycasterMeshes.push(mesh);
        clone.scale.setScalar(
          engine.tools.viewport.breakpoint !== 'desktop' ? 20 : 25,
        );
        clone.add(mesh);
        clone.userData.config = item;
        const object3D = new Object3D();
        object3D.add(clone);
        this.watchesInsideGroup.add(object3D);
      });
      this.add(this.watchesInsideGroup);
    };
    engine.state.register(this);
    this.visible = false;
    this.intersectPoint = {
      target: new Vector3(),
      value: new Vector3(),
    };
    this.plane = new Plane(new Vector3(0, 0, 1), -4);
    this.raycaster = new Raycaster();
    this.raycasterMeshes = [];
  }
  detach() {
    engine.state.unregister(this);
  }
}
const watchScale = 0.125;
let rotorElapsed = 0;
let rotorDelta = 0;
new Vector3();
const sceneRotationMatrix = new Matrix4();
new Matrix3();
class WatchScene extends Scene {
  constructor() {
    super();
    this.handleInitProject = () => {
      var e;
      (e = project.debug) == null || e.mapping.add(this, 'Outliner', 1);
    };
    this.handleAttachProject = () => {
      this.environment = environmentMap(
        engine.webgl.renderer,
        project.assetsManager.get('envmap'),
        false,
      );
      this.detailEnvironmnet = environmentMap(
        engine.webgl.renderer,
        project.assetsManager.get('metalEnvmap'),
        false,
      );
      this.watchesGroup = new WatchVariants();
      this.add(this.watchesGroup);
      this.watch = project.assetsManager
        .get('model')
        .getObjectByName('theWatch');
      this.watchesGroup.addWatches();
      project.store.set(storeKeys.CURRENT_CONFIG, 'first');
      this.laserBeam = new Mesh(
        new PlaneGeometry(0.3, 0.005),
        new LaserMaterial(),
      );
      this.laserBeam.rotation.y = Math.PI * 0.5;
      this.laserBeam.visible = false;
      this.watch.add(this.laserBeam);
      this.watch.scale.setScalar(30);
      this.watchAspectRatioWrapper = new Object3D();
      this.watchAspectRatioWrapper.add(this.watch);
      this.add(this.watchAspectRatioWrapper);
      this.overlayPlane = new Mesh(
        new PlaneGeometry(3, 3),
        new OverlayMaterial(),
      );
      this.overlayPlane.position.set(0, 0, 3);
      this.add(this.overlayPlane);
      this.disassemblyOverlay = new Mesh(
        new PlaneGeometry(3, 3),
        new DisassemblyOverlayMaterial(),
      );
      this.disassemblyOverlay.position.set(0, 0, 3);
      this.disassemblyOverlayWrapper = new Object3D();
      this.disassemblyOverlayWrapper.add(this.disassemblyOverlay);
      this.add(this.disassemblyOverlayWrapper);
      applyMaterials(
        this,
        materialTypes,
        materialConfig.materials,
        'TheWatchMaterial',
        false,
        '',
      );
      this.watchParts = this.collectwatchParts();
      this.materials = configurableMaterials.map((item) => {
        const s = {
          name: item,
          configs: {},
        };
        finishKeys.forEach((item2) => {
          s.configs[item2] =
            materialConfig.materials[item2 == 'first' ? item : item2 + item];
        });
        return s;
      });
      this.materials = this.materials.filter((item) => item !== null);
      this.materials.forEach((item) => {
        const match = this.watchParts.materials.find(
          (item2) => item2.name == item.name,
        );
        match && (item.mainValue = match);
      });
    };
    this.handleDetachProject = () => {
      var e;
      project.state.off(events.INIT_PROJECT, this.handleInitProject);
      project.state.off(events.ATTACH_PROJECT, this.handleAttachProject);
      project.state.off(events.DETACH_PROJECT, this.handleDetachProject);
      project.state.off(events.UPDATE_ROTATIONS, this.handleUpdateRotations);
      engine.state.off(engineEvents.TICK, this.handleTick);
      (e = this.watchesGroup) == null || e.detach();
    };
    this.addMaterialToArray = (value, value2) => {
      value2.indexOf(value) === -1 && value2.push(value);
    };
    this.collectwatchParts = () => {
      const e = {
        horizontal: [],
        horizontalMaterials: [],
        side: [],
        screws: [],
        dialXplod: null,
        emptyXploded: null,
        emptyStrap: null,
        crown: null,
        rotor: null,
        glass: null,
        secondsHand: null,
        rotatingElements: [],
        stepRotatingElements: [],
        materials: [],
        palletFork: null,
        firstHand: null,
        shadowMaterial: null,
        braceletCenters: [],
        bracelets: [],
        hairSpring: null,
        balanceWheel: null,
      };
      this.watch.traverse((mesh) => {
        if (mesh.name.startsWith('bracelet-center')) {
          if (mesh.position.y > 0) return;
          e.braceletCenters.push(mesh);
        } else if (mesh.name.startsWith('bracelet')) {
          if (mesh.position.y > 0) return;
          e.bracelets.push(mesh);
        }
        if (
          (mesh.material &&
            mesh.material.name &&
            (mesh.material.name === 'shadow-planes' &&
              (e.shadowMaterial = mesh.material),
            this.addMaterialToArray(mesh.material, e.materials)),
          mesh.userData.rotationTick
            ? e.rotatingElements.push({
                mesh: mesh,
                time: mesh.userData.rotationTick,
                additionalRotation: initialPartRotations[mesh.name] || 0,
              })
            : initialPartRotations[mesh.name] &&
              (mesh.rotation.z = initialPartRotations[mesh.name]),
          mesh.userData.rotationStep &&
            e.stepRotatingElements.push({
              mesh: mesh,
              time: mesh.userData.rotationStep,
              additionalRotation: 0,
              value: mesh.userData.rotationValue,
            }),
          mesh.name)
        )
          if (
            (mesh.name === 'crystal-front' && (e.glass = mesh),
            mesh.name === 'xplodedSide-2' && (e.crown = mesh),
            mesh.name === 'weight-xploded-2' && (e.rotor = mesh),
            mesh.name === 'dial-xploded-2' && (e.secondsHand = mesh),
            mesh.name === 'xploded-49' && (e.firstHand = mesh),
            mesh.name.startsWith('xplodedSide'))
          )
            e.side.push(mesh);
          else if (mesh.name == 'xploded') e.emptyXploded = mesh;
          else if (mesh.name.startsWith('xploded')) {
            const n = {
              name: mesh.name,
              mesh: mesh,
              xplodPos: new Vector3(),
              xplodRotation: new Vector3(),
              xplodRotationMultiplier: new Vector3(1, 1, 1),
              dialXplodPos: new Vector3(),
              zoomPos: new Vector3(),
              zoomRotation: new Vector3(),
              manipulationRotation: new Vector3(),
              computedRotation: new Vector3(),
              initialPos: new Vector3().copy(mesh.position),
              hover: mesh.userData.hover || null,
              hoverPos: new Vector3(),
              xplodedChildren: [],
              zoomProgress: 0,
            };
            mesh.material &&
              this.addMaterialToArray(mesh.material, e.horizontalMaterials);
            mesh.children &&
              (mesh.traverse((mesh2) => {
                mesh2.name === 'tourbillon-xploded-3' && (e.hairSpring = mesh2);
                mesh2.name === 'tourbillon-xploded-4' &&
                  (e.balanceWheel = mesh2);
                mesh2.name === 'tourbillon-xploded-6' &&
                  (e.palletFork = {
                    mesh: mesh2,
                    rotationValue: mesh2.userData.rotationValue,
                  });
                mesh2.material &&
                  this.addMaterialToArray(
                    mesh2.material,
                    e.horizontalMaterials,
                  );
                mesh2.name.includes('xploded') &&
                  !mesh2.name.startsWith('xploded') &&
                  ((mesh2.userData.initialZPos = mesh2.position.z),
                  n.xplodedChildren.push(mesh2));
              }),
              n.xplodedChildren.sort((value, value2) => {
                const c = parseInt(value.name.split('-').pop(), 10),
                  h = parseInt(value2.name.split('-').pop(), 10);
                return c - h;
              }));
            e.horizontal.push(n);
          } else
            mesh.name.startsWith('screw')
              ? e.screws.push(mesh)
              : mesh.name == 'empty-strap' && (e.emptyStrap = mesh);
      });
      e.horizontal.forEach((item) => {
        const n = (item.xplodedChildren.length + 1) / 2;
        item.xplodedChildren.forEach((item2, index) => {
          item2.userData.xplodRatio =
            ((index + 1 - n) / item.xplodedChildren.length) *
            (explosionScales[item.hover] || 1);
        });
      });
      e.dialXplod = e.horizontal.find((item) => item.name === 'xploded-45');
      e.horizontal.sort((value, value2) => {
        const r = value.name.match(/xploded-(\d{1,2})/),
          l = value2.name.match(/xploded-(\d{1,2})/);
        return r && l ? parseInt(r[1]) - parseInt(l[1]) : 0;
      });
      return e;
    };
    this.handleUpdateRotations = (value) => {
      var s, n, r;
      (n = (s = this.watchParts) == null ? void 0 : s.rotatingElements) ==
        null ||
        n.forEach((item) => {
          item.mesh.rotation.z =
            -(value / item.time) * 2 * Math.PI + item.additionalRotation;
          item.additionalRotation +=
            -project.webgl.longpress.intensity * 2 * (value / item.time);
        });
      (r = this.watchParts) != null &&
        r.palletFork &&
        (this.watchParts.palletFork.mesh.rotation.z =
          this.watchParts.palletFork.rotationValue *
          (this.updateRotationBoolean ? 1 : -1));
      this.updateRotationBoolean = !this.updateRotationBoolean;
    };
    this.handleResize = ({ breakpoint: value }) => {
      const s = value === 'desktop';
      this.disassemblyOverlayWrapper &&
        (this.disassemblyOverlayWrapper.visible = s);
      this.xplodedPosBreakpointMultiplier = s ? 1 : 1.5;
    };
    this.updateEnvmapRotationMatrix = () => {
      globalUniforms.uGlobalEnvmapRotation.value.setFromMatrix4(
        sceneRotationMatrix.makeRotationFromEuler(this.globalEnvmapEuler),
      );
    };
    this.handleTick = ({ et: elapsedTime, dt: deltaTime }) => {
      this.watchParts &&
        ((this.watchAspectRatioWrapper.position.y = Math.min(
          0,
          (1.6 - engine.tools.viewport.ratio) *
            0.25 *
            this.yTranslateAspectIntensity,
        )),
        (rotorDelta = Math.sin(elapsedTime * 20) * 0.4 + 2),
        (this.watchParts.hairSpring.scale.x = rotorDelta),
        (this.watchParts.hairSpring.scale.y = rotorDelta),
        (this.watchParts.hairSpring.rotation.z = Math.sin(elapsedTime * 20)),
        (this.watchParts.balanceWheel.rotation.z = rotorDelta * 4),
        this.watchParts.horizontal.forEach((item) => {
          item.mesh.position.z =
            item.initialPos.z +
            item.zoomPos.z +
            item.hoverPos.z +
            item.xplodPos.z *
              this.xplodedPosMultiplier *
              this.xplodedPosBreakpointMultiplier +
            item.dialXplodPos.z;
          item.mesh.rotation.x =
            item.xplodRotation.x * item.xplodRotationMultiplier.x +
            item.manipulationRotation.x;
          item.mesh.rotation.y =
            item.xplodRotation.y * item.xplodRotationMultiplier.y +
            item.manipulationRotation.y;
        }),
        (elapsedTime - rotorElapsed >= watchScale ||
          project.webgl.longpress.intensity) &&
          (project.state.emit(events.UPDATE_ROTATIONS, elapsedTime),
          (rotorElapsed = elapsedTime)));
    };
    this.background = null;
    project.state.on(events.INIT_PROJECT, this.handleInitProject);
    project.state.on(events.ATTACH_PROJECT, this.handleAttachProject);
    project.state.on(events.DETACH_PROJECT, this.handleDetachProject);
    project.state.on(events.UPDATE_ROTATIONS, this.handleUpdateRotations);
    engine.state.on(engineEvents.RESIZE, this.handleResize);
    engine.state.on(engineEvents.TICK, this.handleTick);
    this.rotorRotationMultiplier = 1;
    this.xplodedPosMultiplier = 1;
    this.xplodedPosBreakpointMultiplier = 1;
    this.xplodAllProgress = 0;
    this.updateRotationBoolean = false;
    this.yTranslateAspectIntensity = 0;
    this.globalEnvmapEuler = new Euler();
  }
}
class ParticlesCamera extends PerspectiveCamera {
  constructor() {
    super();
    this.near = 0.01;
    this.far = 1;
    this.position.z = 2;
  }
}
class ParticlesScene extends Scene {
  constructor() {
    super();
    this.handleInitProject = () => {
      const bufferGeometry = new BufferGeometry(),
        float32Array = new Float32Array(2e4 * 3);
      bufferGeometry.setAttribute(
        'position',
        new BufferAttribute(float32Array, 3),
      );
      const float32Array2 = new Float32Array(2e4);
      for (let c = 0; c < 2e4; c++) float32Array2[c] = Math.random() * 2 - 1;
      bufferGeometry.setAttribute(
        'aSeed',
        new BufferAttribute(float32Array2, 1),
      );
      const float32Array3 = new Float32Array(2e4);
      for (let c = 0; c < 2e4; c++) float32Array3[c] = c;
      bufferGeometry.setAttribute(
        'aIndex',
        new BufferAttribute(float32Array3, 1),
      );
      this.particles = new Points(
        bufferGeometry,
        new ParticlesMaterial({
          defines: {
            PARTICLES_COUNT: (2e4).toFixed(1),
          },
        }),
      );
      this.particles.renderOrder = 2;
      this.particlesPlane = new Mesh(
        new PlaneGeometry(2, 2),
        new ParticlesPlaneMaterial(),
      );
      this.particlesPlane.frustumCulled = false;
      this.particlesPlane.renderOrder = 10;
      this.add(this.particles, this.particlesPlane);
    };
    this.handleAttachProject = () => {
      this.particles.material.uniforms.tNoise.value =
        project.assetsManager.get('noise');
      this.particles.material.uniforms.tNoise.value.wrapS =
        this.particles.material.uniforms.tNoise.value.wrapT = RepeatWrapping;
      this.particles.material.uniforms.tGradient.value =
        project.assetsManager.get('particlesGradient');
      this.particles.material.uniforms.tGradient.value.wrapS =
        this.particles.material.uniforms.tGradient.value.wrapT = RepeatWrapping;
    };
    this.handleDetachProject = () => {};
    project.state.on(events.INIT_PROJECT, this.handleInitProject);
    project.state.on(events.ATTACH_PROJECT, this.handleAttachProject);
    project.state.on(events.DETACH_PROJECT, this.handleDetachProject);
    this.visible = false;
  }
}
class PostProcessing {
  constructor() {
    engine.state.register(this);
    this.renderTarget = new WebGLRenderTarget(
      engine.tools.viewport.width * engine.tools.viewport.dpr,
      engine.tools.viewport.height * engine.tools.viewport.dpr,
      {
        samples: 4,
        colorSpace: SRGBColorSpace,
      },
    );
    this.material = new PostProcessingMaterial({
      uniforms: {
        ...globalUniforms,
        uResolution: {
          value: new Vector2(),
        },
        tDiffuse: {
          value: this.renderTarget.texture,
        },
        uNoise: {
          value: engine.tools.noise.nearestTexture,
        },
        uRatio: {
          value: engine.tools.viewport.ratio,
        },
        uLongpress: {
          value: 0,
        },
        uMouse: {
          value: new Vector2(0, 0),
        },
        uBackgroundMultiplier: {
          value: 1,
        },
      },
    });
    const t = new BufferGeometry()
      .setAttribute(
        'position',
        new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3),
      )
      .setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
    this.quad = new Mesh(t, this.material);
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postScene = new Scene();
    this.postScene.add(this.quad);
    this.renderTarget.texture.colorSpace = SRGBColorSpace;
  }
  onResize({ width: value, height: value2, dpr: value3 }) {
    this.material.uniforms.uResolution.value.set(
      Math.floor(value * value3),
      Math.floor(value2 * value3),
    );
    this.renderTarget.setSize(
      Math.floor(value * value3),
      Math.floor(value2 * value3),
    );
  }
}
export { WatchScene, ParticlesCamera, ParticlesScene, PostProcessing };
