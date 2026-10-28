import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SlowMo } from 'gsap/EasePack';
import {
  initializeEngine,
  engine,
  project,
  engineEvents,
  EventBus,
  loadAssets,
  globalUniforms,
} from './engine';
import { events, WatchDOM, WatchWebGL } from './watch';
import { SplitText } from './SplitText';

export async function startWatch(root, signal) {
  gsap.registerPlugin(SlowMo);
  const stopEngine = initializeEngine(root);
  project.events = events;
  engine.currentProject = project;
  project.state = new EventBus(events);
  project.store = new Map();
  project.dom = null;
  project.webgl = null;
  let context;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    project.webgl?.longpress?.destroy();
    project.dom?.lenis?.destroy();
    cancelAnimationFrame(project.dom?.frameId);
    const controller = project.webgl?.sectionsController;
    if (controller)
      document.removeEventListener('scroll', controller.handleScroll);
    project.state?.emit(events.DETACH_PROJECT);
    project.state?.emit(events.DESTROY_PROJECT);
    project.state?.clear();
    context?.revert();
    SplitText.instances.forEach((instance) => instance.revert());
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    const materials = new Set(),
      textures = new Set(),
      geometries = new Set();
    for (const scene of [project.webgl?.scene, project.webgl?.particlesScene])
      scene?.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        for (const material of [object.material].flat().filter(Boolean)) {
          materials.add(material);
          Object.values(material.uniforms || {}).forEach((uniform) => {
            if (uniform.value?.isTexture) textures.add(uniform.value);
          });
        }
      });
    geometries.forEach((value) => value.dispose());
    materials.forEach((value) => value.dispose());
    textures.forEach((value) => value.dispose());
    project.webgl?.renderTarget1.dispose();
    project.webgl?.renderTarget2.dispose();
    project.webgl?.postProcessing?.renderTarget.dispose();
    delete window.__watchTest;
    stopEngine();
  };
  signal.addEventListener('abort', dispose, { once: true });
  try {
    await loadAssets();
    if (signal.aborted) {
      dispose();
      return dispose;
    }
    context = gsap.context(() => {
      project.dom = new WatchDOM();
      project.webgl = new WatchWebGL();
      project.state.emit(events.INIT_PROJECT);
      project.state.emit(events.ATTACH_PROJECT);
      project.state.emit(events.VIEW_READY_PROJECT);
      engine.state.emit(engineEvents.RESIZE, engine.tools.viewport);
      ScrollTrigger.refresh();
    }, root);
    root.dataset.ready = 'true';
    if (new URLSearchParams(location.search).has('visual-test'))
      window.__watchTest = {
        engine,
        project,
        events: engineEvents,
        gsap,
        ScrollTrigger,
        globalUniforms,
      };
    return dispose;
  } catch (error) {
    console.error('Runtime initialization error', error);
    try {
      dispose();
    } catch (cleanupError) {
      console.error('Runtime cleanup error', cleanupError);
      stopEngine();
    }
    throw error;
  }
}
