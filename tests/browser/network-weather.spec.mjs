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
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-weather-temperature]')).toHaveText('18');
    await expect(page.locator('[data-network-ip]')).toContainText('198.51.100.10');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    expect(await page.evaluate(() => (window.dataLayer || []).some((item) => JSON.stringify(item).includes('198.51.100.10')))).toBe(false);
  });
}
