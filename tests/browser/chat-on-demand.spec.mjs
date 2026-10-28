import { test, expect } from '@playwright/test';

const SDK = `window.chatwootSDK = { run() {
  window.__chatToggles = [];
  const chat = document.createElement('section');
  chat.id = 'qa-chat'; chat.hidden = true;
  chat.setAttribute('role', 'dialog'); chat.setAttribute('aria-label', 'Chatwoot QA');
  chat.textContent = 'Chat ready'; document.body.append(chat);
  window.$chatwoot = { toggle(state) {
    window.__chatToggles.push(state); chat.hidden = state !== 'open';
  }};
  window.dispatchEvent(new Event('chatwoot:ready'));
}};`;

async function isolate(page, sdk = SDK) {
  const googleRequests = [];
  page.on('request', request => {
    if (/googletagmanager|google-analytics|googleadservices|doubleclick/.test(request.url())) googleRequests.push(request.url());
  });
  await page.route('https://**/*', route => route.abort());
  await page.route('**/packs/js/sdk.js', route => route.fulfill({ contentType: 'application/javascript', body: sdk }));
  return googleRequests;
}

async function requestChat(page) {
  await page.locator('.fab-toggle').click();
  await page.locator('.fab-chat').click();
}

for (const locale of ['', 'ru/', 'uk/', 'en/']) {
  test(`chat works before a cookie choice /${locale}`, async ({ page }) => {
    const googleRequests = await isolate(page);
    await page.goto('/' + locale);
    await expect(page.locator('script[data-chatwoot-loader]')).toHaveCount(0);
    await expect(page.locator('#consent-dialog')).toBeVisible();
    await requestChat(page);
    await expect(page.getByRole('dialog', { name: 'Chatwoot QA' })).toBeVisible();
    await expect(page.locator('#consent-dialog')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('naserwis_consent_v1'))).toBeNull();
    expect(googleRequests).toEqual([]);
    expect(await page.evaluate(() => [...window.__chatToggles])).toEqual(['open']);
    await page.evaluate(() => dispatchEvent(new Event('chatwoot:ready')));
    expect(await page.evaluate(() => [...window.__chatToggles])).toEqual(['open']);
    await page.evaluate(() => dispatchEvent(new Event('chatwoot:closed')));
    await expect(page.locator('#consent-dialog')).toBeVisible();
    await page.reload();
    await expect(page.locator('script[data-chatwoot-loader]')).toHaveCount(0);
    expect(googleRequests).toEqual([]);
  });
}

test('chat works after necessary-only choice and preserves that choice', async ({ page }) => {
  const googleRequests = await isolate(page);
  await page.goto('/ru/montaz-sieci/');
  await page.locator('.consent-reject').click();
  const saved = await page.evaluate(() => localStorage.getItem('naserwis_consent_v1'));
  await requestChat(page);
  await expect(page.getByRole('dialog', { name: 'Chatwoot QA' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('naserwis_consent_v1'))).toBe(saved);
  expect(googleRequests).toEqual([]);
  await page.locator('[data-consent-settings]').click();
  await page.locator('.consent-save').click();
  await expect(page.locator('#qa-chat')).toBeHidden();
  await page.evaluate(() => dispatchEvent(new Event('chatwoot:ready')));
  expect(await page.evaluate(() => [...window.__chatToggles])).toEqual(['open', 'close']);
  await page.reload();
  await expect(page.locator('script[data-chatwoot-loader]')).toHaveCount(0);
});

test('failed chat shows fallback and lets the visitor retry', async ({ page }) => {
  const googleRequests = await isolate(page);
  let attempts = 0;
  await page.route('**/packs/js/sdk.js', route => ++attempts === 1 ? route.abort() : route.fulfill({ contentType: 'application/javascript', body: SDK }));
  await page.goto('/');
  await requestChat(page);
  await expect(page.locator('.contact-fallback')).toBeVisible();
  await expect(page.locator('#consent-dialog')).toBeVisible();
  await page.locator('.fab-chat').click();
  await expect(page.getByRole('dialog', { name: 'Chatwoot QA' })).toBeVisible();
  expect(attempts).toBe(2);
  expect(googleRequests).toEqual([]);
});
