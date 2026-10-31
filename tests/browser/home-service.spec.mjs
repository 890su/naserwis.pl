import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

for (const prefix of ['', 'ru/', 'uk/', 'en/']) {
  test(`visible home tasks stay separate from prices at 320px /${prefix}`, async ({ page }) => {
    await page.route(/googletagmanager|google-analytics|clarity|tawk|fonts\.google/, route => route.abort());
    await page.setViewportSize({ width: 320, height: 740 });
    await page.addInitScript(locale => {
      localStorage.setItem('preferredLanguage', locale || 'pl');
      localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false }));
    }, prefix.replace('/', ''));
    await page.goto('/' + prefix);
    const tasks = page.locator('.preview-task-pair');
    const links = tasks.locator('.preview-task-link:not(.preview-business-link)');
    await expect(links).toHaveCount(6);
    for (const link of await links.all()) await expect(link).toBeVisible();
    expect(await tasks.innerText()).not.toMatch(/\d+\s*(?:zł|PLN)/);
    await expect(page.locator('.home-services-details,.home-service-catalog,.home-billing')).toHaveCount(0);
    const homeRates = page.locator('.home-pricing-rates .preview-rate strong');
    await expect(homeRates).toHaveCount(3);
    const amounts = await homeRates.allTextContents();
    expect(amounts.map(text => text.match(/\d+/)[0])).toEqual(['200', '250', '150']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    // This visible scope link must land on the same locale's existing service,
    // with hourly/short-visit alternatives, rather than a duplicate new URL.
    await tasks.locator(`.preview-task-link[href="/${prefix}montaz-sieci/"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${prefix}montaz-sieci/$`));
    await expect(page.locator('.home-billing .price-item')).toHaveCount(3);
    await expect(page.locator('.home-billing .price-item strong')).toHaveText(amounts);
    await expect(page.locator('.billing-rule')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  });
}

test('capture reviewed home tasks and visible billing on desktop and mobile', async ({ page }) => {
  await page.route(/googletagmanager|google-analytics|clarity|tawk|fonts\.google/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mkdir('outputs/seo-week-1-3', { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Tylko niezbędne', exact: true }).click();
  await page.locator('#available-services').scrollIntoViewIfNeeded();
  await expect(page.locator('.preview-task-link:not(.preview-business-link)')).toHaveCount(6);
  await page.screenshot({ path: 'outputs/seo-week-1-3/tasks-desktop.png' });
  await page.locator('#services').scrollIntoViewIfNeeded();
  await expect(page.locator('.home-pricing-rates .preview-rate')).toHaveCount(3);
  for (const note of await page.locator('.home-pricing-notes p').all()) await expect(note).toBeVisible();
  await page.screenshot({ path: 'outputs/seo-week-1-3/billing-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/naprawa-sieci/');
  await page.locator('.home-billing').evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }));
  await page.screenshot({ path: 'outputs/seo-week-1-3/billing-mobile.png' });
});
