import defaultMaterials from '../../config/materials.json';
import {
  Euler,
  Vector2,
  Matrix3,
  Matrix4,
  ShaderMaterial,
  Color,
  FrontSide,
  DoubleSide,
  CustomBlending,
  ZeroFactor,
  OneMinusSrcAlphaFactor,
  AdditiveBlending,
  RawShaderMaterial,
  MultiplyBlending,
} from 'three';
import { engine, globalUniforms, viewportUniforms, project } from '../engine';
import {
  shaderSource,
  coerceMaterialOptions,
  shaderPatch,
} from '../materials/helpers';
import pbrFragmentSource from '../../shaders/pbr-fragment.glsl';
import pbrVertexSource from '../../shaders/pbr-vertex.glsl';
import blackNoiseFragmentSource from '../../shaders/black-noise-fragment.glsl';
import dialFragmentSource from '../../shaders/dial-fragment.glsl';
import disassemblyOverlayFragmentSource from '../../shaders/disassembly-overlay-fragment.glsl';
import glowFragmentSource from '../../shaders/glow-fragment.glsl';
import glowVertexSource from '../../shaders/glow-vertex.glsl';
import handsFragmentSource from '../../shaders/hands-fragment.glsl';
import laserFragmentSource from '../../shaders/laser-fragment.glsl';
import exteriorBrushedFragmentSource from '../../shaders/exterior-brushed-fragment.glsl';
import exteriorBrushedVertexSource from '../../shaders/exterior-brushed-vertex.glsl';
import exteriorGlossyFragmentSource from '../../shaders/exterior-glossy-fragment.glsl';
import glossyFragmentSource from '../../shaders/glossy-fragment.glsl';
import unbakedMetalFragmentSource from '../../shaders/unbaked-metal-fragment.glsl';
import overlayFragmentSource from '../../shaders/overlay-fragment.glsl';
import particlesFragmentSource from '../../shaders/particles-fragment.glsl';
import particlesVertexSource from '../../shaders/particles-vertex.glsl';
import particlesPlaneFragmentSource from '../../shaders/particles-plane-fragment.glsl';
import postProcessingFragmentSource from '../../shaders/post-processing-fragment.glsl';
import shadowFragmentSource from '../../shaders/shadow-fragment.glsl';
import linkBrushedFragmentSource from '../../shaders/link-brushed-fragment.glsl';
import linkGlossyFragmentSource from '../../shaders/link-glossy-fragment.glsl';
const defaultConfiguration = {
  materials: defaultMaterials,
};
function createTextureTransform(material, property) {
  const e = resolveTextureTransform(material, property);
  setMaterialUniform(material, property + 'Transform', e);
  return {
    repeat: material.params[property + 'TransformRepeat'],
    offset: material.params[property + 'TransformOffset'],
    center: material.params[property + 'TransformCenter'],
    rotation: material.params[property + 'TransformRotation'],
    matrix: e,
    update() {
      this.matrix.setUvTransform(
        this.offset.x,
        this.offset.y,
        this.repeat.x,
        this.repeat.y,
        this.rotation,
        this.center.x,
        this.center.y,
      );
      return this;
    },
  }.update();
}
function resolveTextureTransform(material, property) {
  const e = material.params[property],
    s = {
      repeat: new Vector2(),
      offset: new Vector2(),
      center: new Vector2(),
      rotation: 0,
    },
    n = material.params[property + 'TransformRepeat'],
    r = material.params[property + 'TransformOffset'],
    l = material.params[property + 'TransformCenter'],
    c = material.params[property + 'TransformRotation'];
  s.repeat.set(
    (n == null ? void 0 : n.x) || e.repeat.x,
    (n == null ? void 0 : n.y) || e.repeat.y,
  );
  s.offset.set(
    (r == null ? void 0 : r.x) || e.offset.x,
    (r == null ? void 0 : r.y) || e.offset.y,
  );
  s.center.set(
    (l == null ? void 0 : l.x) || e.center.x,
    (l == null ? void 0 : l.y) || e.center.y,
  );
  s.rotation = c || e.rotation;
  material.params[property + 'TransformRepeat'] = s.repeat;
  material.params[property + 'TransformOffset'] = s.offset;
  material.params[property + 'TransformCenter'] = s.center;
  material.params[property + 'TransformRotation'] = s.rotation;
  return new Matrix3().setUvTransform(
    s.offset.x,
    s.offset.y,
    s.repeat.x,
    s.repeat.y,
    s.rotation,
    s.center.x,
    s.center.y,
  );
}
function textureCoordinate(material, channel) {
  return channel === 0 ? ((material.defines.USE_UV = 1), 'uv') : 'uv' + channel;
}
function defineMaterialProperty(material, property, hasUV = false) {
  Object.defineProperty(material, property, {
    set: (value) => {
      material[`_${property}`] = value;
      setMaterialUniform(material, property, value, hasUV);
    },
    get: () => material[`_${property}`],
  });
}
function setMaterialUniform(material, property, value, hasUV = false) {
  if (value == null) return;
  const n =
    (value != null && value.isTexture ? 't' : 'u') +
    (property.charAt(0).toUpperCase() + property.slice(1));
  if (material.uniforms[n]) material.uniforms[n].value = value;
  else {
    if (value != null && value.isTexture) {
      const r = 'SIXTY_' + property.toUpperCase();
      material.defines[r] = 1;
      hasUV &&
        ((material.defines[r + '_UV'] = textureCoordinate(
          material,
          value.channel,
        )),
        (material[property + 'Transform'] = createTextureTransform(
          material,
          property,
        )));
    }
    material.uniforms[n] = {
      value: value,
    };
    material.needsUpdate = true;
  }
}
function observeEuler(rotation, onChange = () => {}) {
  if (
    (rotation.x != null &&
      Object.defineProperty(rotation, 'x', {
        get() {
          return this._x;
        },
        set(value) {
          this._x = value;
          onChange();
        },
      }),
    rotation.y != null &&
      Object.defineProperty(rotation, 'y', {
        get() {
          return this._y;
        },
        set(value) {
          this._y = value;
          onChange();
        },
      }),
    rotation.z != null &&
      Object.defineProperty(rotation, 'z', {
        get() {
          return this._z;
        },
        set(value) {
          this._z = value;
          onChange();
        },
      }),
    typeof rotation.copy == 'function')
  ) {
    const e = rotation.copy;
    rotation.copy = function (value) {
      const n = e.call(this, value);
      onChange();
      return n;
    };
  }
  onChange();
}
const nr = pbrFragmentSource;
const rr = shaderSource(nr, 'fragmentShader');
const or = pbrVertexSource;
const ar = shaderSource(or, 'vertexShader');
const environmentRotationMatrix = new Matrix4();
var prepareMaterialOptions;
var selectMaterialOptions;
class PBRMaterial extends ShaderMaterial {
  constructor(
    params = {},
    options = null,
    options2 = {},
    configTypesMapping = PBRMaterial.CONFIG_TYPES_MAPPING,
    propsWithUV = PBRMaterial.PROPS_WITH_UV,
  ) {
    var p, v, m, y, T, C, P;
    super({
      ...selectMaterialOptions.call(p, params, PBRMaterial.GENERIC_PROPS),
    });
    this.color = undefined;
    this.metalness = undefined;
    this.roughness = undefined;
    this.map = undefined;
    this.emissive = undefined;
    this.emissiveMap = undefined;
    this.ambient = undefined;
    this.ambientIntensity = undefined;
    this.armMap = undefined;
    this.aoMap = undefined;
    this.metalnessMapIntensity = undefined;
    this.roughnessMapIntensity = undefined;
    this.aoMapIntensity = undefined;
    this.normalScale = undefined;
    this.normalMap = undefined;
    this.envMap = undefined;
    this.envMapIntensity = undefined;
    this.envMapRotation = undefined;
    this.additiveEnvMap = undefined;
    this.additiveEnvMapIntensity = undefined;
    this.additiveEnvMapRotation = undefined;
    this.alphaMap = undefined;
    this.configTypesMapping = configTypesMapping;
    this.propsWithUV = propsWithUV;
    prepareMaterialOptions.call(this, params);
    this.isPBRMaterial = true;
    this.type = 'PBRMaterial';
    this.side = FrontSide;
    const envMap = params.envMap;
    envMap != null && envMap.isTexture && (this.envMap = envMap);
    const additiveEnvMap = params.additiveEnvMap;
    additiveEnvMap != null &&
      additiveEnvMap.isTexture &&
      (this.additiveEnvMap = additiveEnvMap);
    const f = {
      color: new Color(16777215),
      metalness: 0,
      roughness: 1,
      map: null,
      emissive: new Color(0),
      emissiveMap: null,
      ambient: new Color(16777215),
      ambientIntensity: 1,
      armMap: null,
      aoMap: null,
      metalnessMapIntensity: 1,
      roughnessMapIntensity: 1,
      aoMapIntensity: 1,
      normalScale: new Vector2(1, 1),
      normalMap: null,
      envMap: envMap,
      envMapIntensity: 1,
      envMapRotation: new Euler(),
      additiveEnvMap: additiveEnvMap,
      additiveEnvMapIntensity: 0.2,
      additiveEnvMapRotation: new Euler(0, 3, 0),
      alphaMap: null,
      alphaTest: 0,
      opacity: 1,
      ...options2,
    };
    this.params = params;
    this.setDefaults(f);
    this.applyParams(selectMaterialOptions.call(v, params, Object.keys(f)));
    this.uniforms.uGlobalEnvmapRotation = globalUniforms.uGlobalEnvmapRotation;
    this.armAsAo =
      ((m = params.armMap) == null ? void 0 : m.isTexture) &&
      ((y = params.aoMap) == null ? void 0 : y.isTexture) &&
      params.armMap === params.aoMap;
    this.armMap && (this.armMap.generateMipmaps = false);
    this.aoMap && (this.aoMap.generateMipmaps = false);
    ar.use(this);
    rr.use(this);
    params.transmission > 0 &&
      ((this.defines.TRANSMISSION = params.transmission.toFixed(2)),
      (this.transparent = true));
    (T = engine.currentProject) != null && T.debug
      ? (C = engine.currentProject) == null ||
        C.debug.mapping.add(
          this,
          'PBRWatch',
          0,
          this.name || params.name || this.type,
          {
            caller: options,
          },
        )
      : (P = engine.debug) == null ||
        P.mapping.add(
          this,
          'PBRWatch',
          0,
          this.name || params.name || this.type,
          null,
          {
            caller: options,
          },
        );
  }
  set armAsAo(value) {
    value
      ? (this.defines.SIXTY_ARM_AS_AO = 1)
      : delete this.defines.SIXTY_ARM_AS_AO;
    this.needsUpdate = true;
  }
  get armAsAo() {
    return Object.hasOwn(this.defines, 'SIXTY_ARM_AS_AO');
  }
  setDefaults(value) {
    for (const s in value) {
      const n = value[s],
        r = this.propsWithUV.includes(s);
      if (s === 'envMapRotation') {
        this._envMapRotation = new Matrix3();
        setMaterialUniform(this, s, this._envMapRotation);
        const material = this;
        observeEuler(n, () =>
          material.uniforms.uEnvMapRotation.value.setFromMatrix4(
            environmentRotationMatrix.makeRotationFromEuler(n),
          ),
        );
      } else if (s === 'additiveEnvMapRotation') {
        this._additiveEnvMapRotation = new Matrix3();
        setMaterialUniform(this, s, this._additiveEnvMapRotation);
        const material = this;
        observeEuler(n, () =>
          material.uniforms.uAdditiveEnvMapRotation.value.setFromMatrix4(
            environmentRotationMatrix.makeRotationFromEuler(n),
          ),
        );
      } else defineMaterialProperty(this, s, r);
      this[s] = n;
    }
  }
  applyParams(value) {
    if (value !== void 0)
      for (const s in value) {
        const n = value[s];
        if (n === void 0) {
          console.warn(`Material: parameter '${s}' has value of undefined.`);
          continue;
        }
        const r = this[s];
        if (r === void 0) {
          console.warn(`Material: '${s}' is not a property of ${this.type}.`);
          continue;
        }
        r != null && r.isColor && n != null && n.isColor
          ? r.set(n)
          : (r != null && r.isVector3 && n != null && n.isVector3) ||
              (r != null && r.isVector2 && n != null && n.isVector2) ||
              (r != null && r.isEuler && n != null && n.isEuler)
            ? r.copy(n)
            : r !== void 0 && n != null && (this[s] = n);
      }
  }
}
prepareMaterialOptions = function (value) {
  coerceMaterialOptions(value, this.configTypesMapping);
  value.armMap =
    value.armMap || value.metalnessMap || value.roughnessMap || null;
  delete value.metalnessMap;
  delete value.roughnessMap;
};
selectMaterialOptions = function (value, value2) {
  return Object.keys(value)
    .filter((item) => value2.includes(item))
    .reduce((value3, value4) => ((value3[value4] = value[value4]), value3), {});
};
PBRMaterial.GENERIC_PROPS = [
  'alphaHash',
  'alphaTest',
  'alphaToCoverage',
  'blendAlpha',
  'blendColor',
  'blendDst',
  'blendDstAlpha',
  'blendEquation',
  'blendEquationAlpha',
  'blendSrc',
  'blendSrcAlpha',
  'blending',
  'colorWrite',
  'defines',
  'depthFunc',
  'depthTest',
  'depthWrite',
  'dithering',
  'forceSinglePass',
  'format',
  'name',
  'opacity',
  'polygonOffset',
  'side',
  'stencilFail',
  'stencilFunc',
  'stencilFuncMask',
  'stencilRef',
  'stencilWrite',
  'stencilWriteMask',
  'stencilZFail',
  'stencilZPass',
  'toneMapped',
  'transparent',
  'userData',
  'vertexColors',
  'visible',
];
PBRMaterial.CONFIG_TYPES_MAPPING = {
  color: Color,
  emissive: Color,
  ambient: Color,
  normalScale: Vector2,
  envMapRotation: Euler,
  additiveEnvMapRotation: Euler,
  mapTransformRepeat: Vector2,
  mapTransformOffset: Vector2,
  mapTransformCenter: Vector2,
  aoMapTransformRepeat: Vector2,
  aoMapTransformOffset: Vector2,
  aoMapTransformCenter: Vector2,
  armMapTransformRepeat: Vector2,
  armMapTransformOffset: Vector2,
  armMapTransformCenter: Vector2,
  emissiveMapTransformRepeat: Vector2,
  emissiveMapTransformOffset: Vector2,
  emissiveMapTransformCenter: Vector2,
  normalMapTransformRepeat: Vector2,
  normalMapTransformOffset: Vector2,
  normalMapTransformCenter: Vector2,
};
PBRMaterial.PROPS_WITH_UV = [
  'map',
  'armMap',
  'aoMap',
  'emissiveMap',
  'normalMap',
];
let BaseMaterial = PBRMaterial;
class WatchMaterial extends BaseMaterial {
  constructor(options) {
    options.envMap || (options.envMap = project.webgl.scene.environment);
    super(options);
    this.aoMap && (this.aoMap.generateMipmaps = false);
    this.uniforms = {
      ...this.uniforms,
      uInvertProgress: {
        value: 0,
      },
      uDarknessProgress: project.webgl.globalUniforms.uDarknessProgress,
    };
  }
}
class StickerMaterial extends WatchMaterial {
  constructor(options) {
    options.transparent = false;
    options.depthWrite = true;
    super(options);
  }
}
class ChronographMaterial extends StickerMaterial {
  constructor(options) {
    options.alphaTest = 0.4;
    super(options);
  }
}
const cr = blackNoiseFragmentSource;
const hr = shaderPatch(cr, 'fragmentShader');
class BlackNoiseMaterial extends WatchMaterial {
  constructor(options = {}) {
    super(options);
    this.uniforms = {
      ...this.uniforms,
      tNNoise: {
        value: project.assetsManager.get('noise'),
      },
    };
    this.side = DoubleSide;
    hr.use(this);
  }
}
const ur = dialFragmentSource;
const pr = shaderSource(ur, 'fragmentShader');
const fr =
  'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const mr = shaderSource(fr, 'vertexShader');
class DialMaterial extends WatchMaterial {
  constructor(options) {
    super(options);
    mr.use(this);
    pr.use(this);
    this.transparent = true;
  }
}
const vr = disassemblyOverlayFragmentSource;
const wr = shaderSource(vr, 'fragmentShader');
const Mr =
  'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}';
const yr = shaderSource(Mr, 'vertexShader');
class DisassemblyOverlayMaterial extends ShaderMaterial {
  constructor(options = {}) {
    super(options);
    this.blending = CustomBlending;
    this.blendSrc = ZeroFactor;
    this.blendDst = OneMinusSrcAlphaFactor;
    this.transparent = true;
    yr.use(this);
    wr.use(this);
    const e = {
      uTime: globalUniforms.uTime,
      uProgress: {
        value: 0,
      },
      uScreenX: {
        value: 0.5,
      },
      uOpacity: {
        value: 0,
      },
      uOpacityMultiplier: {
        value: 1,
      },
      uZoomProgress: {
        value: 0,
      },
    };
    this.uniforms = {
      ...this.uniforms,
      ...e,
    };
  }
}
class LogoMaterial extends StickerMaterial {
  constructor(options) {
    options.alphaTest = 0.5;
    super(options);
  }
}
const br = glowFragmentSource;
const Sr = shaderPatch(br, 'fragmentShader');
const Er = glowVertexSource;
const _r = shaderPatch(Er, 'vertexShader');
class GlowMaterial extends WatchMaterial {
  constructor(options = {}) {
    super(options);
    this.transparent = true;
    this.side = DoubleSide;
    this.uniforms = {
      ...this.uniforms,
    };
    Sr.use(this);
    _r.use(this);
  }
}
const xr = handsFragmentSource;
const Ir = shaderSource(xr, 'fragmentShader');
const Cr =
  'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const Pr = shaderSource(Cr, 'vertexShader');
class HandsMaterial extends WatchMaterial {
  constructor(options) {
    super(options);
    Pr.use(this);
    Ir.use(this);
    this.depthWrite = false;
  }
}
const Rr = laserFragmentSource;
const Dr = shaderSource(Rr, 'fragmentShader');
const Lr =
  'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const Ur = shaderSource(Lr, 'vertexShader');
class LaserMaterial extends ShaderMaterial {
  constructor(options = {}) {
    super(options);
    Ur.use(this);
    Dr.use(this);
    this.transparent = true;
    this.depthWrite = false;
    this.uniforms = {
      uTime: globalUniforms.uTime,
      uColor: {
        value: new Color(4473924),
      },
      uOpacityMultiplier: {
        value: 1,
      },
      uOpacity: {
        value: 0,
      },
    };
  }
}
const kr = exteriorBrushedFragmentSource;
const Nr = shaderPatch(kr, 'fragmentShader');
const Br = exteriorBrushedVertexSource;
const $r = shaderPatch(Br, 'vertexShader');
class ExteriorBrushedMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.defines.USE_UV1 = 1;
    $r.use(this);
    Nr.use(this);
  }
}
const Fr = exteriorGlossyFragmentSource;
const Vr = shaderPatch(Fr, 'fragmentShader');
const Hr = `/// #replace #define SIXTY_UNIFORMS_AREA
varying vec2 vUv1;
/// #replace #define SIXTY_START_AREA
vUv1=uv1;`;
const Gr = shaderPatch(Hr, 'vertexShader');
class ExteriorGlossyMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.defines.USE_UV1 = 1;
    this.uniforms = {
      ...this.uniforms,
      uNNoise: {
        value: engine.tools.noise.normalTexture,
      },
    };
    Gr.use(this);
    Vr.use(this);
  }
}
class InteriorBrushedMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.uniforms = {
      ...this.uniforms,
    };
  }
}
class CirclesMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
  }
}
const qr = glossyFragmentSource;
const Zr = shaderPatch(qr, 'fragmentShader');
const jr = `/// #replace #define SIXTY_UNIFORMS_AREA
varying vec2 vUv1;
/// #replace #define SIXTY_START_AREA
vUv1=uv1;`;
const Qr = shaderPatch(jr, 'vertexShader');
class GlossyMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.defines.USE_UV1 = 1;
    this.uniforms = {
      ...this.uniforms,
      uBlueMetalColor: globalUniforms.uBlueMetalColor,
      uGoldMetalColor: globalUniforms.uGoldMetalColor,
    };
    Qr.use(this);
    Zr.use(this);
  }
}
const Kr = unbakedMetalFragmentSource;
const eo = shaderPatch(Kr, 'fragmentShader');
const to = `/// #replace #define SIXTY_UNIFORMS_AREA
varying vec2 vUv1;
/// #replace #define SIXTY_START_AREA
vUv1=uv1;`;
const so = shaderPatch(to, 'vertexShader');
class UnbakedMetalMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.uniforms = {
      ...this.uniforms,
      uBlueMetalColor: globalUniforms.uBlueMetalColor,
      uGoldMetalColor: globalUniforms.uGoldMetalColor,
    };
    this.defines.USE_UV1 = 1;
    so.use(this);
    eo.use(this);
  }
}
class NumbersMaterial extends StickerMaterial {
  constructor(options) {
    options.alphaTest = 0.5;
    super(options);
  }
}
const ro = overlayFragmentSource;
const oo = shaderSource(ro, 'fragmentShader');
const ao =
  'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}';
const lo = shaderSource(ao, 'vertexShader');
class OverlayMaterial extends ShaderMaterial {
  constructor(options = {}) {
    super(options);
    this.blending = CustomBlending;
    this.blendSrc = ZeroFactor;
    this.blendDst = OneMinusSrcAlphaFactor;
    this.transparent = true;
    lo.use(this);
    oo.use(this);
    const e = {
      uTime: globalUniforms.uTime,
      uProgress: {
        value: 0,
      },
      uOpenProgress: {
        value: 0,
      },
    };
    this.uniforms = {
      ...this.uniforms,
      ...e,
    };
  }
}
const co = particlesFragmentSource;
const ho = shaderSource(co, 'fragmentShader');
const uo = particlesVertexSource;
const po = shaderSource(uo, 'vertexShader');
class ParticlesMaterial extends ShaderMaterial {
  constructor(options = {}) {
    super(options);
    po.use(this);
    ho.use(this);
    this.depthTest = false;
    this.depthWrite = false;
    this.blending = AdditiveBlending;
    const e = {
      uTime: globalUniforms.uTime,
      uMouse: {
        value: new Vector2(0),
      },
      tNoise: {
        value: null,
      },
      tGradient: {
        value: null,
      },
      uOpacity: {
        value: 0,
      },
      uProgress: {
        value: 0,
      },
      uResolution: viewportUniforms.uResolution,
      uPass: {
        value: 0,
      },
    };
    this.uniforms = {
      ...this.uniforms,
      ...e,
    };
    this.defines = {
      ...this.defines,
      ...options.defines,
    };
  }
}
const fo = particlesPlaneFragmentSource;
const mo = shaderSource(fo, 'fragmentShader');
const go =
  'varying vec2 vUv;uniform float uProgress;void main(){vUv=uv;gl_Position=vec4(position,1.0);}';
const vo = shaderSource(go, 'vertexShader');
class ParticlesPlaneMaterial extends ShaderMaterial {
  constructor(options = {}) {
    super(options);
    vo.use(this);
    mo.use(this);
    this.transparent = true;
    this.depthTest = false;
    this.depthWrite = false;
    const e = {
      uTime: globalUniforms.uTime,
      tLastDiffuse: {
        value: null,
      },
      tDiffuse: {
        value: null,
      },
      uOpacity: {
        value: 0,
      },
      uProgress: {
        value: 0,
      },
      uPass: {
        value: 0,
      },
    };
    this.uniforms = {
      ...this.uniforms,
      ...e,
    };
  }
}
const wo = postProcessingFragmentSource;
const Mo = shaderSource(wo, 'fragmentShader');
const yo =
  'attribute vec3 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}';
const To = shaderSource(yo, 'vertexShader');
class PostProcessingMaterial extends RawShaderMaterial {
  constructor(options = {}) {
    super(options);
    To.use(this);
    Mo.use(this);
  }
}
class RubyMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.envmap = project.webgl.scene.detailEnvironmnet;
    super(options);
  }
}
const So = shadowFragmentSource;
const Eo = shaderSource(So, 'fragmentShader');
const _o =
  'varying vec2 vUv;void main(){vUv=uv;vec3 pos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}';
const Ao = shaderSource(_o, 'vertexShader');
class ShadowMaterial extends WatchMaterial {
  constructor(options) {
    super(options);
    Ao.use(this);
    Eo.use(this);
    this.depthWrite = false;
    this.transparent = true;
    this.blending = MultiplyBlending;
    this.uniforms = {
      ...this.uniforms,
      uOpacity: {
        value: 1,
      },
    };
  }
  set alpha(value) {
    this.uniforms.uOpacity.value = value;
  }
  get alpha() {
    return this.uniforms.uOpacity.value;
  }
}
const Io = linkBrushedFragmentSource;
const Co = shaderPatch(Io, 'fragmentShader');
const Po = `/// #replace #define SIXTY_UNIFORMS_AREA
/// #replace #define SIXTY_START_AREA
`;
const Oo = shaderPatch(Po, 'vertexShader');
class LinkBrushedMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.defines.USE_UV1 = 1;
    Oo.use(this);
    Co.use(this);
  }
}
const Do = linkGlossyFragmentSource;
const Lo = shaderPatch(Do, 'fragmentShader');
const Uo = `/// #replace #define SIXTY_UNIFORMS_AREA
/// #replace #define SIXTY_START_AREA
`;
const ko = shaderPatch(Uo, 'vertexShader');
class LinkGlossyMaterial extends WatchMaterial {
  constructor(options = {}) {
    options.additiveEnvMap = project.webgl.scene.detailEnvironmnet;
    super(options);
    this.defines.USE_UV1 = 1;
    ko.use(this);
    Lo.use(this);
  }
}
const materialTypes = {
  automaticChronograph: ChronographMaterial,
  dial: BlackNoiseMaterial,
  dialnumbersao: DialMaterial,
  DisassemblyOverlay: DisassemblyOverlayMaterial,
  fsp: LogoMaterial,
  glass: GlowMaterial,
  glow: HandsMaterial,
  LaserMaterial: LaserMaterial,
  metalbrushedext: ExteriorBrushedMaterial,
  metalglossyext: ExteriorGlossyMaterial,
  metalbrushed: InteriorBrushedMaterial,
  metalcircles: CirclesMaterial,
  metalglossy: GlossyMaterial,
  metalglossynobake: UnbakedMetalMaterial,
  numbersnekst: NumbersMaterial,
  Overlay: OverlayMaterial,
  PBR: BaseMaterial,
  ParticlesMaterial: ParticlesMaterial,
  ParticlesPlaneMaterial: ParticlesPlaneMaterial,
  material: PostProcessingMaterial,
  ruby: RubyMaterial,
  shadowplanes: ShadowMaterial,
  singlemetalbrushed: LinkBrushedMaterial,
  singlemetalglossy: LinkGlossyMaterial,
  StickerMaterial: StickerMaterial,
  TheWatchMaterial: WatchMaterial,
};
const materialConfig = {
  ...defaultConfiguration,
};
export {
  DisassemblyOverlayMaterial,
  LaserMaterial,
  OverlayMaterial,
  ParticlesMaterial,
  ParticlesPlaneMaterial,
  PostProcessingMaterial,
  materialTypes,
  materialConfig,
};
