import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const wifi = 'jak-wzmocnic-sygnal-wifi-w-domu/';
const lan = 'siec-lan-w-domu-przed-remontem/';
async function isolate(page) {
  await page.route(/googletagmanager|google-analytics|clarity|tawk|fonts\.google/, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, updatedAt: new Date().toISOString() })));
}
for (const prefix of ['', 'ru/', 'uk/', 'en/']) {
  for (const slug of [wifi, lan]) {
    test(`reading levels, keyboard and mobile /${prefix}${slug}`, async ({ page }) => {
      await isolate(page);
      await page.setViewportSize({ width: 320, height: 740 });
      await page.goto(`/${prefix}poradnik/${slug}`);
      await expect(page.locator('#simple')).toBeVisible();
      await expect(page.locator('#technical')).toBeHidden();
      const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
      await page.locator('#select-simple').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#technical')).toBeVisible();
      await expect(page.locator('#simple')).toBeHidden();
      await expect(page.locator('#select-technical')).toBeFocused();
      await page.locator('#select-technical').hover();
      expect(await page.locator('#select-technical').evaluate(element => getComputedStyle(element).color)).toBe('rgb(255, 255, 255)');
      expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe(canonical);
      await expect(page).toHaveURL(/#technical$/);
      expect(await page.locator('[hreflang=ru][data-guide-language]').getAttribute('href')).toContain('#technical');
      await page.reload();
      await expect(page.locator('#technical')).toBeVisible();
      await page.locator('#select-simple').click();
      await page.goBack();
      await expect(page.locator('#technical')).toBeVisible();
      await page.locator('#technical .guide-toc a').nth(1).click();
      await expect(page).toHaveURL(/#technical-2$/);
      await page.reload();
      await expect(page.locator('#technical-2')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
      await page.locator('.guide-service a').click();
      await expect(page).toHaveURL(new RegExp(`/${prefix}${slug === wifi ? 'naprawa-wifi' : 'montaz-sieci'}/$`));
    });
  }
  test(`guide discovery /${prefix}`, async ({ page }) => {
    await isolate(page);
    await page.goto('/' + prefix);
    await page.locator('.guides-teaser a').last().click();
    await expect(page).toHaveURL(new RegExp(`/${prefix}poradnik/$`));
    await expect(page.locator('.guide-cards article')).toHaveCount(2);
    await page.locator('.guide-cards h2 a').first().click();
    await expect(page.locator('#simple')).toBeVisible();
  });
}
test('both full versions and anchor navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route(/googletagmanager|fonts\.google/, route => route.abort());
  await page.goto('/poradnik/' + lan);
  await expect(page.locator('#simple')).toBeVisible();
  await expect(page.locator('#technical')).toBeVisible();
  await page.locator('#select-technical').click();
  await expect(page).toHaveURL(/#technical$/);
  await context.close();
});
test('capture both reading levels and mobile table', async ({ page }) => {
  await isolate(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mkdir('outputs/guides-2026-10-10', { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/ru/poradnik/' + wifi);
  const reject = page.getByRole('button', { name: 'Только обязательные', exact: true });
  if (await reject.isVisible()) await reject.click();
  await page.screenshot({ path: 'outputs/guides-2026-10-10/simple-desktop.png' });
  await page.locator('#select-technical').click();
  await page.screenshot({ path: 'outputs/guides-2026-10-10/technical-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#obstacles').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'outputs/guides-2026-10-10/obstacles-mobile.png' });
});
