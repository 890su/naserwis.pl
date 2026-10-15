import { test, expect } from '@playwright/test';

const routes = [
  '/pogoda-internet-warszawa/',
  '/ru/pogoda-internet-varshava/',
  '/uk/pohoda-internet-varshava/',
  '/en/weather-internet-warsaw/',
];

for (const route of routes) {
  test(`localized weather and connection tool ${route}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
    await page.route('**/api/weather', (request) => request.fulfill({ json: { current: { temperature: 18, feelsLike: 17, humidity: 55, windSpeed: 2.5, pressure: 1015, precipitation: 0, symbol: 'clearsky_day' }, forecast: [{ time: '2026-09-06T12:00:00Z', temperature: 18, precipitation: 0, windSpeed: 2.5, symbol: 'clearsky_day' }] } }));
    await page.route('**/api/network', (request) => request.fulfill({ json: { ip: '198.51.100.10', ipVersion: 'IPv4', provider: 'Test ISP', asn: 64500, city: 'Warsaw', country: 'PL', edge: 'WAW', tls: 'TLSv1.3' } }));
    await page.setViewportSize({ width: 390, height: 760 });
    const prefix = route.startsWith('/ru/') ? '/ru/' : route.startsWith('/uk/') ? '/uk/' : route.startsWith('/en/') ? '/en/' : '/';
    await page.goto(`${prefix}poradnik/`);
    await expect(page.locator(`.services-menu a[href="${route}"]`)).toHaveCount(0);
    await page.locator('.guide-tools h2 a').click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.locator('#header .guides-nav-link[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-weather-temperature]')).toHaveText('18');
    await expect(page.locator('[data-network-ip]')).toContainText('198.51.100.10');
    await expect(page.locator('.nw-metrics > div')).toHaveCount(4);
    await expect(page.locator('.nw-temperature-context [data-weather-feels]')).toHaveText('17 °C');
    await expect(page.locator('.nw-full-tests a[target="_blank"]')).toHaveCount(2);
    await expect(page.locator('.nw-cta-actions')).toContainText('+48 453 327 678');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    expect(await page.evaluate(() => (window.dataLayer || []).some((item) => JSON.stringify(item).includes('198.51.100.10')))).toBe(false);
  });
}

test('missing weather measurements stay unknown rather than becoming zero', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
  await page.route('**/api/weather', route => route.fulfill({ json: { current: { temperature: 0, feelsLike: null, humidity: null, windSpeed: null, pressure: null, precipitation: 0, symbol: 'unknown' }, forecast: [] } }));
  await page.route('**/api/network', route => route.fulfill({ json: {} }));
  await page.goto('/pogoda-internet-warszawa/');
  await expect(page.locator('[data-weather-temperature]')).toHaveText('0');
  await expect(page.locator('[data-weather-feels]')).toHaveText('— °C');
  await expect(page.locator('[data-weather-humidity]')).toHaveText('—%');
  await expect(page.locator('[data-weather-pressure]')).toHaveText('— hPa');
});

test('light test runs only on request and restores controls after success or failure', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({version:1,analytics:false,marketing:false,support:false})));
  await page.route('**/api/weather', route => route.fulfill({status:503,json:{}}));
  await page.route('**/api/network', route => route.fulfill({json:{}}));
  let probes=0, releaseFirst;
  const firstProbe=new Promise(resolve => {releaseFirst=resolve;});
  await page.route('**/api/network-probe?**', async route => {
    probes++;
    if(probes===1) await firstProbe;
    const bytes=Number(new URL(route.request().url()).searchParams.get('bytes'));
    await route.fulfill({contentType:'application/octet-stream',body:Buffer.alloc(bytes)});
  });
  await page.goto('/pogoda-internet-warszawa/');
  const button=page.locator('[data-network-test]');
  await expect(button).toBeVisible();
  await expect(page.locator('[data-test-results]')).toBeHidden();
  expect(probes).toBe(0);
  await button.click();
  await expect(button).toBeDisabled();
  releaseFirst();
  await expect(page.locator('[data-test-results]')).toBeVisible();
  await expect(button).toBeEnabled();
  await expect(page.locator('[data-test-speed]')).toContainText('Mb/s');
  expect(probes).toBe(8);
  await page.route('**/api/network-probe?**', route => route.fulfill({status:503,body:''}));
  await button.click();
  await expect(page.locator('[data-network-status]')).toContainText('Dane chwilowo niedostępne');
  await expect(button).toBeEnabled();
});
