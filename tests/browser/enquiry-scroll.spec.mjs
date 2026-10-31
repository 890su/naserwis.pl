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

async function expectAutomaticMovement(list) {
  const before = await list.evaluate(el => el.scrollTop);
  // The animated offset can wrap at the end of its loop.
  await expect.poll(async () => Math.abs(await list.evaluate(el => el.scrollTop) - before)).toBeGreaterThan(2);
}

for (const route of ['', 'naprawa-wifi/', 'naprawa-sieci/', 'montaz-sieci/', 'serwis-monitoringu/']) {
  test(`wheel scrolls the page over text and row edges while examples keep moving /ru/${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 1000 });
    await prepare(page, route);
    const form = page.locator(route ? '#final-form' : '#hero-form');
    const list = form.locator('.enquiry-example-list');
    await expect(form.locator('[data-examples-pause]')).toHaveCount(0);
    for (const target of ['text', 'left', 'right']) {
      const point = await textPoint(list);
      const area = await list.boundingBox();
      const x = target === 'text' ? point.x : target === 'left' ? area.x + 2 : area.x + area.width - 2;
      await page.mouse.move(x, point.y);
      await expectAutomaticMovement(list);
      const pageBefore = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 100);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(pageBefore + 60);
      await expectAutomaticMovement(list);
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
  test(`touch scrolls the page over text and row edges while examples keep moving /ru/${route}`, async ({ browser }) => {
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
          await page.waitForTimeout(16);
        }
        // Measure before ending the gesture so fling inertia cannot affect the next check.
        const result = await page.evaluate(() => scrollY);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        // Let the previous gesture's native momentum finish before starting a
        // gesture elsewhere; otherwise it can look like the new area scrolled.
        await expect.poll(async () => {
          const before = await page.evaluate(() => scrollY);
          await page.waitForTimeout(100);
          return page.evaluate(previous => Math.abs(scrollY - previous), before);
        }).toBeLessThan(1);
        return result;
      }
      for (const target of ['text', 'left', 'right']) {
        const point = await textPoint(list);
        const area = await list.boundingBox();
        await expectAutomaticMovement(list);
        const before = await page.evaluate(() => scrollY);
        const x = target === 'text' ? point.x : target === 'left' ? area.x + 2 : area.x + area.width - 2;
        const after = await swipe({ x, y: point.y });
        expect(after).toBeGreaterThan(before + 30);
        await expectAutomaticMovement(list);
      }
    } finally { await context.close(); }
  });
}

test('service contacts stay centered and the mobile phone stays after the form on resize', async ({ page }) => {
  await prepare(page, 'naprawa-wifi/');
  for (const width of [390, 768, 900, 901, 1199, 1200, 1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const form = page.locator('#final-form');
    const heroPhone = page.locator('.hero .preview-hero-call');
    const mobilePhone = page.locator('.mobile-enquiry-slot .preview-home-mobile-call');
    if (width <= 900) {
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
