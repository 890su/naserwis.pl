import { test, expect } from '@playwright/test';

test('fresh and necessary-only visits make no optional third-party requests', async ({ page }) => {
  const optionalRequests = [];
  await page.route(/googletagmanager|google-analytics|googleadservices|googlesyndication|fonts\.google|ai\.czait\.pl/, route => {
    optionalRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/');
  await expect(page.locator('.consent-reject')).toBeVisible();
  await expect(page.locator('.consent-panel')).toHaveAttribute('role', 'region');
  await expect(page.locator('.consent-panel')).not.toHaveAttribute('aria-modal');
  expect(optionalRequests).toEqual([]);
  await page.locator('.consent-reject').click();
  await page.goto('/naprawa-wifi/');
  await expect(page.locator('#consent-dialog')).toBeHidden();
  expect(optionalRequests).toEqual([]);
});

test('analytics-only consent loads GA4 without configuring the Ads destination', async ({ page }) => {
  const googleRequests = [];
  await page.route(/googletagmanager/, route => { googleRequests.push(route.request().url()); return route.abort(); });
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: true, marketing: false, support: false })));
  await page.goto('/');
  await expect.poll(() => googleRequests.length).toBe(1);
  expect(googleRequests[0]).toContain('id=G-FVC64PTKR3');
  const destinations = await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'config').map(item => item[1]));
  expect(destinations).toEqual(['G-FVC64PTKR3']);
});

test('accepting optional categories loads Google once and configures both destinations', async ({ page }) => {
  const requests = [];
  await page.route(/googletagmanager|ai\.czait\.pl/, route => { requests.push(route.request().url()); return route.abort(); });
  await page.goto('/');
  await page.locator('.consent-accept').click();
  await expect.poll(() => requests.filter(url => url.includes('googletagmanager')).length).toBe(1);
  expect(requests.find(url => url.includes('googletagmanager'))).toContain('id=AW-18394870871');
  const destinations = await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'config').map(item => item[1]));
  expect(destinations).toEqual(['AW-18394870871', 'G-FVC64PTKR3']);
  await page.locator('[data-consent-settings]').click();
  await page.locator('.consent-reject').click();
  const storage = await page.evaluate(() => window.NASERWIS_CONSENT.get());
  expect(storage.analytics).toBe(false); expect(storage.marketing).toBe(false);
  expect(requests.filter(url => url.includes('googletagmanager'))).toHaveLength(1);
});

test('quick-contact focus trap skips the hidden honeypot and restores the opener', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/naprawa-wifi/');
  const opener = page.locator('.mobile-contact-request');
  await opener.click();
  await expect(page.locator('.quick-contact-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#quick-form .form-privacy-notice a')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.quick-contact-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('reduced motion leaves content visible and reviews do not autoplay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
  await page.goto('/');
  await expect(page.locator('.problem-card').first()).toHaveCSS('opacity', '1');
  const initial = await page.locator('.reviews-track').evaluate(el => el.scrollLeft);
  await page.clock.runFor(12000);
  expect(await page.locator('.reviews-track').evaluate(el => el.scrollLeft)).toBe(initial);
});

test('skip link moves keyboard focus past navigation to the main content', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.site-skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#hero-name')).toBeFocused();
});

test('floating enquiry modal restores focus to the visible launcher on Escape', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
  await page.goto('/');
  await page.locator('.fab-toggle').click();
  await page.locator('.fab-form').click();
  await expect(page.locator('.quick-contact-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.fab-toggle')).toBeFocused();
});
