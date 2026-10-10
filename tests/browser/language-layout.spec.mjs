import { test, expect } from '@playwright/test';

function contrast(foreground, background) {
  const luminance = color => color.match(/[\d.]+/g).slice(0, 3)
    .map(Number).map(value => value / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

for (const [locale, destination] of [['en-US', '/en/'], ['ru-RU', '/ru/'], ['uk-UA', '/uk/']]) {
  test.describe(`first visit ${locale}`, () => {
    test.use({ locale });
    for (const route of ['/', '/poradnik/jak-wzmocnic-sygnal-wifi-w-domu/']) {
    for (const width of [320, 768, 1280]) {
      test(`language suggestion preserves painted content at ${width}px ${route}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        let releaseRuntime;
        const runtimeHeld = new Promise(resolve => { releaseRuntime = resolve; });
        await page.route(/\/assets\/site-[a-f0-9]+\.js$/, async route => {
          await runtimeHeld;
          await route.continue();
        });
        const navigation = page.goto(route);
        try {
          await expect(page.locator('h1')).toBeVisible();
          const before = await page.locator('h1').boundingBox();
          releaseRuntime();
          await navigation;
          const banner = page.locator('#lang-suggestion');
          await expect(banner).toBeVisible();
          expect((await page.locator('h1').boundingBox()).y).toBeCloseTo(before.y, 1);
          const target = new URL(await banner.locator('a').getAttribute('href'), page.url());
          expect(target.pathname.replace(/\/*$/, '/')).toBe(destination + route.slice(1));
          const positions = await page.evaluate(() => {
            const banner = document.querySelector('#lang-suggestion');
            const header = document.querySelector('#header');
            const logo = document.querySelector('.logo span');
            const question = banner.querySelector('span');
            const link = banner.querySelector('a');
            const close = banner.querySelector('button');
            const b = banner.getBoundingClientRect();
            return {
              top: b.top, bottom: b.bottom, left: b.left, right: b.right,
              headerBottom: header.getBoundingClientRect().bottom,
              firstContentTop: document.querySelector('main a, main h1').getBoundingClientRect().top,
              viewport: document.documentElement.clientWidth,
              logoColor: getComputedStyle(logo).color,
              background: getComputedStyle(banner).backgroundColor,
              questionColor: getComputedStyle(question).color,
              linkColor: getComputedStyle(link).color,
              linkBackground: getComputedStyle(link).backgroundColor,
              closeColor: getComputedStyle(close).color,
              questionIsExposed: document.elementFromPoint(question.getBoundingClientRect().left + 5, question.getBoundingClientRect().top + 5) === question,
            };
          });
          expect(positions.top).toBeGreaterThanOrEqual(positions.headerBottom);
          expect(positions.bottom).toBeLessThanOrEqual(positions.firstContentTop);
          expect(positions.left).toBeGreaterThanOrEqual(0);
          expect(positions.right).toBeLessThanOrEqual(positions.viewport);
          expect(positions.questionIsExposed).toBe(true);
          expect(contrast(positions.logoColor, 'rgb(255, 255, 255)')).toBeGreaterThanOrEqual(4.5);
          expect(contrast(positions.questionColor, positions.background)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(positions.linkColor, positions.linkBackground)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(positions.closeColor, positions.background)).toBeGreaterThanOrEqual(4.5);
          const heading = await page.locator('h1').boundingBox();
          await banner.locator('button').click();
          await expect(banner).toHaveCount(0);
          expect((await page.locator('h1').boundingBox()).y).toBeCloseTo(heading.y, 1);
        } finally {
          releaseRuntime();
          await navigation.catch(() => {});
        }
      });
    }
    }
  });
}
