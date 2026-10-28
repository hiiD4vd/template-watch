import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const results = [];
const assets = JSON.parse(await fs.readFile('src/config/assets.json', 'utf8'));
const assetBaseUrl = (
  process.env.NEXT_PUBLIC_WATCH_ASSET_BASE_URL || assets.baseUrl
).replace(/\/$/, '');
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [],
      failedRequests = [];
    const mediaRequests = new Set();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) =>
      failedRequests.push(`${request.failure()?.errorText} ${request.url()}`),
    );
    page.on('request', (request) => {
      if (
        /^https?:/.test(request.url()) &&
        /\.(?:glb|exr|png|jpe?g|webp|ico|woff2?|ttf)(?:\?|$)/i.test(
          new URL(request.url()).pathname,
        )
      )
        mediaRequests.add(request.url());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failedRequests.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(process.env.WATCH_URL || 'http://127.0.0.1:3000', {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true', {
      timeout: 30000,
    });
    await page.waitForTimeout(5000);
    await expect(page.locator('[data-section]')).toHaveCount(14);
    await expect(page.locator('#canvas-wrapper canvas')).toHaveCount(1);
    await expect(page.locator('#loader')).toBeHidden();
    for (const finish of ['second', 'third', 'fourth', 'first']) {
      await page
        .locator(`[data-section="Intro"] .circle-svg [data-config="${finish}"]`)
        .dispatchEvent('click');
      await expect(
        page.locator('[data-section="Intro"] .fps-color-wrapper .selected'),
      ).toHaveAttribute('data-config', finish);
      await expect(
        page.locator('[data-section="Colors"] .circle-svg .selected'),
      ).toHaveAttribute('data-config', finish);
      await page.waitForTimeout(1300);
    }
    await page.mouse.move(viewport.width * 0.5, viewport.height * 0.5);
    await page.mouse.down();
    await page.waitForTimeout(1000);
    await expect(page.locator('#the-watch')).toHaveClass(/longpress/);
    await page.mouse.up();
    await page.waitForTimeout(1300);
    await expect(page.locator('#the-watch')).not.toHaveClass(/longpress/);
    const layout = await page
      .locator('[data-section="Disassembly"]')
      .evaluate((el) => ({
        top: el.getBoundingClientRect().top + scrollY,
        height: el.getBoundingClientRect().height,
      }));
    await page.evaluate(
      ({ top, height }) => scrollTo(0, top + (height - innerHeight) * 0.55),
      layout,
    );
    await page.waitForTimeout(3500);
    await page.screenshot({
      path: `artifacts/interaction-${viewport.width}-disassembly.png`,
      timeout: 120000,
    });
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3500);
    await expect(page.locator('[data-section="Parts"] li')).toHaveCount(10);
    await expect(page.locator('[data-section="Footer"]')).toBeInViewport();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
    expect(errors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(mediaRequests.size).toBeGreaterThan(10);
    expect(
      [...mediaRequests].filter((url) => !url.startsWith(assetBaseUrl + '/')),
    ).toEqual([]);
    expect(
      [...mediaRequests].some(
        (url) =>
          new URL(url).pathname ===
          new URL(`${assetBaseUrl}/models/watch.glb`).pathname,
      ),
    ).toBe(true);
    const brokenImages = await page
      .locator('img')
      .evaluateAll(
        (images) =>
          images
            .filter((image) => {
              const bounds = image.getBoundingClientRect();
              const visible =
                bounds.bottom > 0 &&
                bounds.top < innerHeight &&
                bounds.right > 0 &&
                bounds.left < innerWidth;
              return visible && (!image.complete || image.naturalWidth === 0);
            })
            .map((image) => ({
              src: image.currentSrc || image.src,
              complete: image.complete,
              width: image.naturalWidth,
            })),
      );
    expect(brokenImages).toEqual([]);
    results.push({
      viewport,
      sections: 14,
      finishes: 4,
      longPress: true,
      parts: 10,
      errors,
      failedRequests,
      mediaRequests: mediaRequests.size,
      allMediaFromR2: true,
    });
    console.log('PASS', viewport);
    await page.close();
  }
  await fs.writeFile(
    'artifacts/interaction-results.json',
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
