import { test, expect } from '@playwright/test';

for (const width of [390, 1280]) {
  for (const route of ['/ru/', '/ru/naprawa-wifi/', '/ru/pogoda-internet-varshava/', '/ru/poradnik/', '/ru/poradnik/jak-wzmocnic-sygnal-wifi-w-domu/']) {
    test(`no unstyled first frame at ${width}px ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route(/googletagmanager|google-analytics|clarity|tawk|fonts\.google/, request => request.abort());
      await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, updatedAt: new Date().toISOString() })));
      let release, requested;
      const pending = new Promise(resolve => { release = resolve; });
      const intercepted = new Promise(resolve => { requested = resolve; });
      await page.route('**/styles.css?*', async request => {
        requested();
        await pending;
        await request.continue();
      });
      try {
        await page.goto(route, { waitUntil: 'commit' });
        await intercepted;
        // CSS blocks painting, so requestAnimationFrame may not run yet.
        await page.waitForFunction(() => document.querySelector('#header') && document.querySelector('h1'), null, { polling: 50 });
        // Allow a few frames while the base stylesheet is deliberately pending.
        await page.waitForTimeout(250);
        expect(await page.evaluate(() => performance.getEntriesByType('paint').length)).toBe(0);
      } finally {
        release();
      }
      await page.waitForLoadState('load');
      await expect(page.locator('.services-menu')).toBeHidden();
      await expect(page.locator('#lang-menu')).toBeHidden();
      await expect(page.locator('h1')).toBeVisible();
      await expect.poll(() => page.evaluate(() => performance.getEntriesByName('first-contentful-paint').length)).toBe(1);
    });
  }
}
