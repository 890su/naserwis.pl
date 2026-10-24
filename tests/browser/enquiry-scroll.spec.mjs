import { test, expect } from '@playwright/test';

async function prepare(page, route) {
  await page.addInitScript(() => {
    localStorage.setItem('preferredLanguage', 'ru');
    localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false }));
  });
  await page.goto('/ru/' + route);
}

async function textPoint(list) {
  await list.scrollIntoViewIfNeeded();
  return list.evaluate(el => {
    const area = el.getBoundingClientRect();
    for (const span of el.querySelectorAll('.enquiry-example-text')) {
      for (const rect of span.getClientRects()) {
        if (rect.top > area.top + 32 && rect.bottom < area.bottom - 32) {
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
    }
    throw new Error('No visible example text');
  });
}

for (const route of ['', 'naprawa-wifi/', 'naprawa-sieci/', 'montaz-sieci/', 'serwis-monitoringu/']) {
  test(`wheel routes text to the list and both sides to the page /ru/${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 1000 });
    await prepare(page, route);
    const form = page.locator(route ? '#final-form' : '#hero-form');
    const list = form.locator('.enquiry-example-list');
    await expect(form.locator('[data-examples-pause]')).toHaveCount(0);
    const text = await textPoint(list);
    await page.mouse.move(text.x, text.y);
    const before = await list.evaluate(el => el.scrollTop);
    const pageBefore = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 100);
    await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(before + 60);
    expect(await page.evaluate(() => scrollY)).toBe(pageBefore);
    for (const side of ['left', 'right']) {
      await list.scrollIntoViewIfNeeded();
      const area = await list.boundingBox();
      await page.mouse.move(side === 'left' ? area.x + 2 : area.x + area.width - 2, area.y + 100);
      const listBefore = await list.evaluate(el => el.scrollTop);
      const pageBefore = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 100);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(pageBefore + 60);
      expect(await list.evaluate(el => el.scrollTop)).toBe(listBefore);
    }
    // Empty row space still highlights/selects the same full-width option.
    await list.scrollIntoViewIfNeeded();
    const point = await textPoint(list);
    const area = await list.boundingBox();
    await page.mouse.move(area.x + 2, point.y);
    const hovered = form.locator('[data-enquiry-example].is-hovered');
    await expect(hovered).toHaveCount(1);
    const label = await hovered.textContent();
    expect((await hovered.boundingBox()).width).toBeCloseTo(area.width, 0);
    await page.mouse.click(area.x + 2, point.y);
    await expect(form.locator('textarea')).toHaveValue(label);
    await expect(form.locator('.enquiry-details')).toBeVisible();
  });
}

for (const route of ['', 'serwis-monitoringu/']) {
  test(`touch gestures keep their native scroll destination /ru/${route}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    try {
      await prepare(page, route);
      const list = page.locator(route ? '#final-form .enquiry-example-list' : '#hero-form .enquiry-example-list');
      const cdp = await context.newCDPSession(page);
      async function swipe(point) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, radiusX: 1, radiusY: 1, force: 1 }] });
        for (let i = 1; i <= 8; i++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - i * 12, radiusX: 1, radiusY: 1, force: 1 }] });
        }
        // Measure before ending the gesture so fling inertia cannot affect the next check.
        const result = await list.evaluate(el => ({ list: el.scrollTop, page: scrollY }));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        // Let the previous gesture's native momentum finish before starting a
        // gesture elsewhere; otherwise it can look like the new area scrolled.
        await expect.poll(async () => {
          const before = await list.evaluate(el => ({ list: el.scrollTop, page: scrollY }));
          await page.waitForTimeout(100);
          return list.evaluate((el, previous) => Math.abs(el.scrollTop - previous.list) + Math.abs(scrollY - previous.page), before);
        }).toBe(0);
        return result;
      }
      const point = await textPoint(list);
      const before = await list.evaluate(el => ({ list: el.scrollTop, page: scrollY }));
      const after = await swipe(point);
      expect(after.list).toBeGreaterThan(before.list + 30);
      expect(after.page).toBe(before.page);
      for (const side of ['left', 'right']) {
        await list.scrollIntoViewIfNeeded();
        const area = await list.boundingBox();
        const before = await list.evaluate(el => ({ list: el.scrollTop, page: scrollY }));
        const after = await swipe({ x: side === 'left' ? area.x + 2 : area.x + area.width - 2, y: area.y + 170 });
        expect(after.page).toBeGreaterThan(before.page + 30);
        expect(Math.abs(after.list - before.list)).toBeLessThan(2);
      }
    } finally { await context.close(); }
  });
}

test('service contacts stay centered and the mobile phone stays after the form on resize', async ({ page }) => {
  await prepare(page, 'naprawa-wifi/');
  for (const width of [390, 768, 1000, 1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const form = page.locator('#final-form');
    const heroPhone = page.locator('.hero .preview-hero-call');
    const mobilePhone = page.locator('.mobile-enquiry-slot .preview-home-mobile-call');
    if (width <= 760) {
      await expect(heroPhone).toBeHidden();
      await expect(mobilePhone).toBeVisible();
      const bounds = await form.boundingBox();
      expect((await mobilePhone.boundingBox()).y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
    } else {
      await expect(heroPhone).toBeVisible();
      await expect(mobilePhone).toBeHidden();
    }
    if (width < 1200) await expect(form.locator('.contact-alternatives')).toHaveCSS('justify-content', 'center');
  }
});
