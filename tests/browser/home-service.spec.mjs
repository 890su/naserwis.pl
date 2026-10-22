import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

for (const prefix of ['', 'ru/', 'uk/', 'en/']) {
  test(`home catalogue stays separate from prices at 320px /${prefix}`, async ({ page }) => {
    await page.route(/googletagmanager|google-analytics|clarity|tawk|fonts\.google/, route => route.abort());
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/' + prefix);
    await page.locator('.home-services-details > summary').click();
    await expect(page.locator('.home-service-link')).toHaveCount(6);
    expect(await page.locator('.home-service-catalog').innerText()).not.toMatch(/\d+\s*(?:zł|PLN)/);
    await expect(page.locator('.home-billing .price-row[role=row]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    // This visible scope link must land on the same locale's existing service,
    // with hourly/short-visit alternatives, rather than a duplicate new URL.
    await page.locator('.home-service-link').nth(2).click();
    await expect(page).toHaveURL(new RegExp(`/${prefix}montaz-sieci/$`));
    await expect(page.locator('.home-billing .price-item')).toHaveCount(3);
    await expect(page.locator('.billing-rule')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  });
}

test('capture reviewed home catalogue and billing on desktop and mobile', async ({ page }) => {
  await page.route(/googletagmanager|google-analytics|clarity|tawk|fonts\.google/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mkdir('outputs/seo-week-1-3', { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Tylko niezbędne', exact: true }).click();
  await page.locator('.home-services-details > summary').click();
  await page.locator('#available-services').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'outputs/seo-week-1-3/catalog-desktop.png' });
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.locator('.home-pricing-details > summary').click();
  await page.screenshot({ path: 'outputs/seo-week-1-3/billing-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/naprawa-sieci/');
  await page.locator('.home-billing').evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }));
  await page.screenshot({ path: 'outputs/seo-week-1-3/billing-mobile.png' });
});
