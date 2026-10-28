import { chromium } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (error) => console.log('PAGE ERROR', error.stack));
page.on('console', (message) => {
  if (message.type() === 'error')
    console.log('CONSOLE ERROR', message.text().slice(0, 5000));
});
await page.goto(process.env.WATCH_URL || 'http://127.0.0.1:3000', {
  waitUntil: 'networkidle',
  timeout: 120000,
});
await page.waitForTimeout(8000);
await page.screenshot({ path: 'artifacts/migration-first.png' });
console.log('ready:', await page.locator('#app').getAttribute('data-ready'));
await browser.close();
