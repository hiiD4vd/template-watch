import {
  Color,
  Matrix3,
  Vector2,
  WebGLRenderer,
  TextureLoader,
  CanvasTexture,
  RepeatWrapping,
  NearestFilter,
  LinearFilter,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { gsap } from 'gsap';
import { assetUrl } from '../lib/assets';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

export const debugEnabled = false;
export const engineEvents = Object.fromEntries(
  [
    'ATTACH',
    'DETACH',
    'RESIZE',
    'TICK',
    'RENDER',
    'BEFORE_TICK',
    'AFTER_RENDER',
    'POINTER_MOVE',
    'POINTER_UP',
    'POINTER_DOWN',
    'POINTER_LOCK',
    'KEY_DOWN',
    'KEY_UP',
  ].map((name, index) => [name, index]),
);
export const globalUniforms = {
  uTime: { value: 0 },
  uGoldMetalColor: { value: new Color(16640446) },
  uBlueMetalColor: { value: new Color(8036556) },
  uGlobalEnvmapRotation: { value: new Matrix3() },
};
export const viewportUniforms = {
  uRatio: { value: 1 },
  uDPR: { value: 1 },
  uResolution: { value: new Vector2() },
};

export class EventBus {
  listeners = new Map();
  constructor(events) {
    this.events = events;
  }
  on(event, callback, options = {}, instance = this) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners
      .get(event)
      .add({ callback, instance, options, lastUpdate: 0 });
  }
  off(event, callback, instance = this) {
    for (const listener of this.listeners.get(event) || [])
      if (listener.callback === callback && listener.instance === instance)
        this.listeners.get(event).delete(listener);
  }
  emit(event, ...args) {
    for (const listener of this.listeners.get(event) || [])
      listener.callback.apply(listener.instance, args);
  }
  emitThrottle(event, timing) {
    for (const listener of this.listeners.get(event) || []) {
      if (
        listener.options.fps &&
        timing.et - listener.lastUpdate < 1 / listener.options.fps
      )
        continue;
      listener.callback.call(listener.instance, timing);
      listener.lastUpdate = timing.et;
    }
  }
  register(instance, options = {}) {
    for (const [name, event] of Object.entries(this.events)) {
      const method =
        'on' +
        name
          .toLowerCase()
          .split('_')
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join('');
      if (typeof instance[method] === 'function')
        this.on(event, instance[method], options, instance);
    }
  }
  unregister(instance) {
    for (const listeners of this.listeners.values())
      for (const listener of listeners)
        if (listener.instance === instance) listeners.delete(listener);
  }
  clear() {
    this.listeners.clear();
  }
}

export const engine = {
  state: new EventBus(engineEvents),
  tools: {},
  webgl: {},
  debug: null,
};
export const project = {
  state: null,
  store: new Map(),
  assetsManager: null,
  dom: null,
  webgl: null,
  debug: null,
  events: null,
};

function createNoise() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  const pixels = context.getImageData(0, 0, 256, 256);
  pixels.data.forEach((_, index) => {
    pixels.data[index] = Math.round(Math.random() * 255);
  });
  context.putImageData(pixels, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.minFilter = texture.magFilter = LinearFilter;
  const nearestTexture = new CanvasTexture(canvas);
  nearestTexture.wrapS = nearestTexture.wrapT = RepeatWrapping;
  nearestTexture.minFilter = nearestTexture.magFilter = NearestFilter;
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = normalCanvas.height = 256;
  const normalContext = normalCanvas.getContext('2d');
  normalContext.drawImage(canvas, 0, 0);
  const source = normalContext.getImageData(0, 0, 256, 256),
    output = normalContext.getImageData(0, 0, 256, 256),
    length = source.data.length;
  const wrap = (index) =>
    index < 0 ? length - 256 + index : index >= length ? index % length : index;
  for (let index = 0; index < length; index += 4)
    source.data[index] =
      (source.data[index] + source.data[index + 1] + source.data[index + 2]) /
      3;
  for (let index = 0; index < length; index += 4) {
    output.data[index] =
      128 +
      (source.data[Math.max(0, index + 4)] -
        source.data[Math.min(length, index - 4)]) *
        2;
    output.data[index + 1] =
      128 +
      (source.data[wrap(index + 1024)] - source.data[wrap(index - 1024)]) * 2;
    output.data[index + 2] = 256 - source.data[index] * 0.5;
    output.data[index + 3] = 256;
  }
  normalContext.putImageData(output, 0, 0);
  const normalTexture = new CanvasTexture(normalCanvas);
  normalTexture.wrapS = normalTexture.wrapT = RepeatWrapping;
  return { texture, nearestTexture, normalTexture };
}

export function initializeEngine(root) {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  gsap.config({ force3D: true });
  gsap.defaults({ ease: 'none', duration: 0.5 });
  for (const [name, curve] of Object.entries({
    'immg.zoomIn': '0.9,0,0.4,1',
    'immg.zoomOut': '0.4,0,0.1,1',
    'immg.posIn': '0.4,0,0.1,1',
    'immg.posOut': '0.9,0,0.4,1',
    'immg.expoOut': '0.14,1,0.34,1',
    'immg.expoIn': '0.66,0,0.86,0',
    'sixty.expoInOut': '0.225,0.415,0.3,1',
  }))
    CustomEase.create(name, curve);
  engine.$app = root;
  engine.$wrapper = root.querySelector('#canvas-wrapper');
  engine.state = new EventBus(engineEvents);
  const viewport = {
    width: innerWidth,
    height: innerHeight,
    dpr: Math.min(devicePixelRatio, 2),
    ratio: innerWidth / innerHeight,
    breakpoint:
      innerWidth < 768 ? 'mobile' : innerWidth < 1025 ? 'tablet' : 'desktop',
  };
  viewport.isMobileAtLaunch = viewport.breakpoint === 'mobile';
  engine.tools.viewport = viewport;
  engine.tools.noise = createNoise();
  const renderer = new WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.autoClear = false;
  renderer.setClearColor(new Color(0xffffff), 0);
  engine.webgl.renderer = renderer;
  engine.$wrapper.prepend(renderer.domElement);
  const resize = () => {
    Object.assign(viewport, {
      width: innerWidth,
      height: engine.$wrapper.clientHeight,
      dpr: Math.min(devicePixelRatio, 2),
      breakpoint:
        innerWidth < 768 ? 'mobile' : innerWidth < 1025 ? 'tablet' : 'desktop',
    });
    viewport.ratio = viewport.width / viewport.height;
    document.body.style.setProperty('--vh', `${viewport.height * 0.01}px`);
    viewportUniforms.uRatio.value = viewport.ratio;
    viewportUniforms.uDPR.value = viewport.dpr;
    viewportUniforms.uResolution.value.set(viewport.width, viewport.height);
    renderer.setSize(viewport.width, viewport.height);
    renderer.setPixelRatio(viewport.dpr);
    engine.state.emit(engineEvents.RESIZE, viewport);
  };
  resize();
  const coordinates = {
    dom: new Vector2(innerWidth / 2, innerHeight / 2),
    webgl: new Vector2(),
  };
  const mouse = {
    coordinates,
    isDown: false,
    isTouch: matchMedia('(pointer: coarse)').matches,
  };
  engine.tools.mouse = mouse;
  const move = (event) => {
    const point = event.touches?.[0] || event;
    coordinates.dom.set(point.clientX, point.clientY);
    coordinates.webgl.set(
      (point.clientX / viewport.width) * 2 - 1,
      (-point.clientY / viewport.height) * 2 + 1,
    );
    engine.state.emit(engineEvents.POINTER_MOVE, coordinates);
  };
  const down = (event) => {
    mouse.isDown = true;
    mouse.isTouch = event.pointerType !== 'mouse';
    move(event);
    engine.state.emit(engineEvents.POINTER_DOWN, coordinates);
  };
  const up = (event) => {
    if (mouse.isDown) {
      mouse.isDown = false;
      engine.state.emit(engineEvents.POINTER_UP, coordinates, event);
    }
  };
  const controller = new AbortController(),
    options = { signal: controller.signal };
  root.addEventListener('mousemove', move, options);
  root.addEventListener('touchmove', move, { ...options, passive: true });
  root.addEventListener('pointerdown', down, options);
  root.addEventListener('mouseup', up, options);
  root.addEventListener('touchend', up, options);
  root.addEventListener('pointerleave', up, options);
  window.addEventListener('resize', resize, options);
  let frame = 0,
    previous = Date.now(),
    elapsed = 0,
    active = true;
  const tick = () => {
    if (!active) return;
    frame = requestAnimationFrame(tick);
    const now = Date.now(),
      delta = now - previous;
    previous = now;
    elapsed += delta;
    const timing = { et: elapsed * 0.001, dt: Math.min(delta, 60) * 0.001 };
    globalUniforms.uTime.value = timing.et;
    engine.state.emitThrottle(engineEvents.TICK, timing);
    engine.state.emitThrottle(engineEvents.RENDER, timing);
  };
  engine.core = {
    ticker: {
      pause() {
        active = false;
        cancelAnimationFrame(frame);
      },
    },
  };
  engine.state.emit(engineEvents.ATTACH);
  tick();
  return () => {
    active = false;
    cancelAnimationFrame(frame);
    controller.abort();
    engine.state.emit(engineEvents.DETACH);
    engine.state.clear();
    Object.values(engine.tools.noise).forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}

export async function loadAssets() {
  const textures = new TextureLoader(),
    environments = new EXRLoader(),
    models = new GLTFLoader();
  const assets = new Map();
  const entries = [
    ['noise', textures, assetUrl('textures/noise.png')],
    ['envmap', environments, assetUrl('environments/studio.exr')],
    ['metalEnvmap', environments, assetUrl('environments/metal-detail.exr')],
    ['model', models, assetUrl('models/watch.glb')],
    [
      'particlesGradient',
      textures,
      assetUrl('textures/particles-gradient.jpg'),
    ],
  ];
  await Promise.all(
    entries.map(async ([name, loader, path]) => {
      const asset = await loader.loadAsync(path);
      assets.set(name, asset.scene || asset);
    }),
  );
  project.assetsManager = { get: (name) => assets.get(name) };
  return assets;
}
