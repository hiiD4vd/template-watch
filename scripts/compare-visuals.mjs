import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { referenceAsset } from './reference.mjs';

await fs.mkdir('artifacts/comparison', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: [
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});
const report = [];
for (const [device, viewport] of Object.entries({
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 },
})) {
  let sections = [];
  for (const [variant, path] of [
    ['reference', '/'],
    ['react', '/'],
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== 'http://127.0.0.1:3000') return route.continue();
      let response, asset;
      if (variant === 'reference') {
        try {
          asset = referenceAsset(url.pathname);
        } catch {
          return route.fulfill({
            status: 404,
            body: 'Reference asset not found',
          });
        }
      } else {
        if (!url.pathname.endsWith('.js')) return route.continue();
        response = await route.fetch();
        asset = { body: await response.body(), contentType: 'text/javascript' };
      }
      if (url.pathname.endsWith('.js'))
        asset.body = asset.body
          .toString()
          .replace(
            /Math\.round\(Math\.random\(\)\s*\*\s*255\)/g,
            'Math.round(window.__noiseRandom()*255)',
          )
          .replace(
            /Math\.random\(\)\s*\*\s*2\s*-\s*1/g,
            '(window.__particleRandom()*2-1)',
          );
      await route.fulfill({
        ...asset,
        ...(response ? { response } : { status: 200 }),
      });
    });
    await page.addInitScript(() => {
      const NativeDate = Date;
      window.Date = class extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : ['2026-10-28T10:10:00+07:00']));
        }
        static now() {
          return NativeDate.now();
        }
      };
      let seed = 12345;
      Math.random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      let noiseSeed = 31415,
        particleSeed = 92653;
      window.__noiseRandom = () => {
        noiseSeed = (noiseSeed * 16807) % 2147483647;
        return (noiseSeed - 1) / 2147483646;
      };
      window.__particleRandom = () => {
        particleSeed = (particleSeed * 16807) % 2147483647;
        return (particleSeed - 1) / 2147483646;
      };
    });
    await page.goto(`http://127.0.0.1:3000${path}?visual-test=1`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await page.waitForTimeout(7000);
    await page
      .locator('[data-section="Intro"]')
      .waitFor({ state: 'attached', timeout: 30000 });
    if (variant === 'reference')
      await page.evaluate(async () => {
        const original = await import('/assets/index-Ck-pEZ8v.js');
        window.__watchTest = {
          engine: original.d,
          project: original.d.currentProject,
          events: original.G,
          gsap: original.z,
          ScrollTrigger: original.B,
          globalUniforms: original.N,
        };
      });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const { engine, project, gsap, globalUniforms, events, ScrollTrigger } =
        window.__watchTest;
      engine.state.emit(events.RESIZE, engine.tools.viewport);
      ScrollTrigger.refresh();
      engine.core.ticker.pause();
      project.dom.lenis.stop();
      gsap.ticker.sleep();
      gsap.globalTimeline
        .getChildren(false, true, true)
        .filter(
          (animation) =>
            !animation.paused() &&
            !animation.scrollTrigger &&
            animation.repeat() !== -1,
        )
        .forEach((animation) => animation.totalProgress(1));
      gsap.globalTimeline.pause();
      globalUniforms.uTime.value = 10;
      document.getAnimations().forEach((animation) => {
        try {
          animation.finish();
        } catch {}
      });
    });
    if (variant === 'reference')
      sections = await page.locator('[data-section]').evaluateAll((elements) =>
        elements.map((el) => ({
          name: el.dataset.section,
          top: el.getBoundingClientRect().top + scrollY,
          height: el.getBoundingClientRect().height,
        })),
      );
    if (sections.length !== 14)
      throw new Error(`Expected 14 sections; got ${sections.length}`);
    for (const section of sections) {
      await page.evaluate(({ top, height, name }) => {
        const position =
          name === 'Intro' ? 0 : top + Math.max(0, (height - innerHeight) / 2);
        scrollTo(0, position);
        const { engine, project, events, ScrollTrigger } = window.__watchTest;
        project.dom.lenis.resize();
        const controller = project.webgl.sectionsController;
        controller.targetScroll = position;
        controller.currentScroll = position;
        controller.currentDOMScroll = position;
        ScrollTrigger.update();
        for (let index = 0; index < 240; index++)
          engine.state.emit(events.TICK, { et: 10, dt: 1 / 60 });
        engine.state.emit(events.RENDER, { et: 10, dt: 0 });
      }, section);
      await page.waitForTimeout(100);
      if (
        process.env.WATCH_SECTIONS &&
        !process.env.WATCH_SECTIONS.split(',').includes(section.name)
      )
        continue;
      const file = `artifacts/comparison/${device}-${section.name}-${variant}.png`;
      if (section.name === 'Hands') {
        const state = await page.evaluate(() => {
          const { project } = window.__watchTest;
          const camera = project.webgl.camera;
          const controller = project.webgl.sectionsController;
          return {
            camera: Object.fromEntries(
              Object.entries(camera).filter(
                ([, value]) => typeof value === 'number',
              ),
            ),
            position: camera.position.toArray(),
            rotation: camera.rotation.toArray(),
            controller: Object.fromEntries(
              Object.entries(controller).filter(
                ([, value]) => typeof value === 'number',
              ),
            ),
            sections: controller.sections.map((s) => ({
              name: s.el?.dataset,
              progress: s.progress,
              top: s.top,
              height: s.height,
            })),
            layout: Array.from(document.querySelectorAll('[data-webgl]')).map(
              (el) => ({
                name: el.dataset.webgl,
                top: el.getBoundingClientRect().top + scrollY,
                height: el.getBoundingClientRect().height,
              }),
            ),
          };
        });
        await fs.writeFile(
          `artifacts/comparison/${device}-${variant}-state.json`,
          JSON.stringify(state, null, 2),
        );
      }
      await page.screenshot({ path: file, timeout: 120000 });
      console.log('captured', device, variant, section.name);
    }
    report.push({ device, variant, errors });
    await page.close();
  }
  for (const section of sections) {
    if (
      process.env.WATCH_SECTIONS &&
      !process.env.WATCH_SECTIONS.split(',').includes(section.name)
    )
      continue;
    const images = await Promise.all(
      ['reference', 'react'].map(async (variant) =>
        PNG.sync.read(
          await fs.readFile(
            `artifacts/comparison/${device}-${section.name}-${variant}.png`,
          ),
        ),
      ),
    );
    const [reference, react] = images,
      diff = new PNG({ width: reference.width, height: reference.height });
    const different = pixelmatch(
      reference.data,
      react.data,
      diff.data,
      reference.width,
      reference.height,
      { threshold: 0.1 },
    );
    const match = 100 * (1 - different / (reference.width * reference.height));
    await fs.writeFile(
      `artifacts/comparison/${device}-${section.name}-diff.png`,
      PNG.sync.write(diff),
    );
    report.push({
      device,
      section: section.name,
      match: Number(match.toFixed(3)),
      different,
    });
    console.log(device, section.name, match.toFixed(3));
  }
}
await fs.writeFile(
  'artifacts/comparison/report.json',
  JSON.stringify(report, null, 2),
);
await browser.close();
const failures = report.filter((result) =>
  result.errors ? result.errors.length > 0 : result.match < 98,
);
if (failures.length) {
  console.error('Visual regression checks failed:', failures);
  process.exitCode = 1;
}
