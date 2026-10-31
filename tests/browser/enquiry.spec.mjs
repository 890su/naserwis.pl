import { test, expect } from '@playwright/test';

// A slow bundle must not move the already painted mobile content below the form.
for (const route of ['', 'serwis-monitoringu/']) {
  for (const width of [412, 768]) {
    test(`stable initial form with delayed JavaScript /${route} at ${width}`, async ({ page }) => {
      await prepare(page, 'pl');
      await page.setViewportSize({ width, height: 1000 });
      let release;
      const ready = new Promise(resolve => { release = resolve; });
      await page.route('**/assets/site-*.js', async handler => { await ready; await handler.continue(); });
      await page.goto('/' + route, { waitUntil: 'commit' });
      const form = page.locator(route ? '#final-form' : '#hero-form');
      const following = page.locator('.mobile-enquiry-slot + section');
      try {
        await expect(form.locator('[name=message]')).toBeVisible();
        expect(await form.evaluate(el => !!el.closest('.mobile-enquiry-slot'))).toBe(true);
        await page.evaluate(() => document.fonts.ready);
        const before = await following.boundingBox();
        // The first render is intentionally observed before releasing the application bundle.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        release();
        await expect(form.locator('[name=phone]')).toHaveAttribute('aria-describedby', /-error/);
        const after = await following.boundingBox();
        expect(Math.abs(before.y - after.y)).toBeLessThan(1);
      } finally { release(); }
    });
  }
}

async function prepare(page, lang) {
  await page.addInitScript(locale => {
    localStorage.setItem('preferredLanguage', locale);
    localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false }));
  }, lang);
}

async function selectExample(example) {
  // Expand the real control before aiming at a row: the looping examples move
  // between coordinate lookup and mouse click, especially with two QA workers.
  const all = example.locator('xpath=ancestor::form').locator('[data-examples-all]');
  if (await all.getAttribute('aria-expanded') === 'false') await all.click();
  await example.scrollIntoViewIfNeeded();
  // Click an actual text line, including wrapped copy; both text and empty row
  // space leave wheel/touch scrolling to the page.
  const point = await example.locator('.enquiry-example-text').evaluate(el => {
    const rect = el.getClientRects()[0];
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });
  await example.page().mouse.click(point.x, point.y);
}

for (const route of ['', 'serwis-monitoringu/']) {
  for (const gesture of ['wheel', 'touch']) {
    test.describe(`${route || '/'} ${gesture} input`, () => {
      test.use({ isMobile: gesture === 'touch', hasTouch: gesture === 'touch', viewport: { width: gesture === 'touch' ? 390 : 1440, height: 1000 } });
    test(`example ${gesture} scrolls the page without stopping motion /${route}`, async ({ page }) => {
      await prepare(page, 'pl');
      await page.goto('/' + route);
      const list = page.locator(`${route ? '#final-form' : '#hero-form'} .enquiry-example-list`);
      await list.scrollIntoViewIfNeeded();
      const bounds = await list.boundingBox();
      const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
      await page.mouse.move(x, y);
      const initialOffset = await list.evaluate(el => el.scrollTop);
      await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(initialOffset + 3);
      const pageStart = await page.evaluate(() => scrollY);
      if (gesture === 'wheel') await page.mouse.wheel(0, 100);
      else {
        const client = await page.context().newCDPSession(page);
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let step = 1; step <= 6; step++) {
          await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 20 }] });
          await page.waitForTimeout(30);
        }
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await client.detach();
      }
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(pageStart + 30);
      const offsetAfterGesture = await list.evaluate(el => el.scrollTop);
      await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(offsetAfterGesture + 3);
    });
    });
  }
}

for (const lang of ['pl', 'ru', 'uk', 'en']) {
  for (const route of ['', 'naprawa-wifi/', 'naprawa-sieci/', 'montaz-sieci/', 'serwis-monitoringu/']) {
    for (const width of [390, 1440]) {
      test(`progressive enquiry ${lang}/${route} at ${width}`, async ({ page }) => {
        await prepare(page, lang);
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${lang === 'pl' ? '/' : '/' + lang + '/'}${route}`);
        const form = page.locator(route ? '#final-form' : '#hero-form');
        await expect(form.locator('.enquiry-details')).toBeHidden();
        await expect(form.locator('[name=message]')).toBeVisible();
        await expect(form.locator('.enquiry-example-list')).toBeVisible();
        expect(await form.locator('.enquiry-example-list').evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan((await form.boundingBox()).width - 3);
        if (width === 390) {
          expect(await form.evaluate(el => Boolean(el.closest('.mobile-enquiry-slot')))).toBe(true);
          expect(await page.locator('.hero').evaluate(el => el.nextElementSibling.className)).toBe('mobile-enquiry-slot');
          const call = await page.locator('.preview-hero-call:visible').boundingBox();
          const bounds = await form.boundingBox();
          expect(call.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
        } else {
          expect(await form.evaluate(el => Boolean(el.closest('.preview-contact-rail, .preview-service-rail')))).toBe(true);
        }
        if (route === 'serwis-monitoringu/') await expect(page.locator('.cctv-jumps')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        // Selecting an example starts step two and retains an editable description.
        const example = form.locator('[data-enquiry-example]').first();
        const text = await example.textContent();
        await selectExample(example);
        await expect(form.locator('[name=message]')).toHaveValue(text);
        await expect(form.locator('[name=message]')).toBeFocused();
        await expect(form.locator('.enquiry-details')).toBeVisible();
        expect(await form.locator('.enquiry-details').evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan((await form.boundingBox()).width - 3);
        await expect(form.locator('.enquiry-examples')).toBeHidden();
        await form.locator('[name=requestType][value=broken]').check();
        await form.locator('[name=urgency][value=soon]').check();
        await form.locator('[name=phone]').fill('qa@example.test');
        await form.locator('.enquiry-extras summary').click();
        await form.locator('[name=name]').fill('Я');
        await form.locator('[name=address]').fill('Warszawa, test 12');
        // The same controls and values survive both responsive placements.
        await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 1000 });
        await expect(form.locator('[name=message]')).toHaveValue(text);
        await expect(form.locator('[name=address]')).toHaveValue('Warszawa, test 12');
        let requests = 0;
        await page.route('**/api/contact', async handler => {
          const data = handler.request().postDataJSON();
          expect(data).toMatchObject({ contactFlow: 'staged', lang, message: text, name: 'Я', phone: 'qa@example.test', address: 'Warszawa, test 12', requestType: 'broken', urgency: 'soon' });
          requests++;
          await handler.fulfill({ status: requests === 1 ? 502 : 200, json: requests === 1 ? { success: false, message: 'QA retry' } : { success: true, message: 'QA accepted', leadId: 'local-only' } });
        });
        await form.locator('[type=submit]').click();
        await expect(form.locator('[role=alert]')).toHaveText('QA retry');
        await expect(form.locator('[name=message]')).toHaveValue(text);
        await form.locator('[type=submit]').click();
        await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
        await expect(form.locator('.enquiry-details')).toBeHidden();
        expect(requests).toBe(2);
      });
    }
  }
}

test('owner-requested example motion, keyboard selection and manual typing takeover', async ({ page }) => {
  await prepare(page, 'pl');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const form = page.locator('#hero-form');
  await expect(form.locator('[data-examples-pause]')).toHaveCount(0);
  const list = form.locator('.enquiry-example-list');
  const start = await list.evaluate(el => el.scrollTop);
  await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(start + 5);
  await form.locator('[data-examples-all]').click();
  await expect(form.locator('[data-examples-all]')).toHaveAttribute('aria-expanded', 'true');
  await expect(form.locator('[data-example-clone]').first()).toBeHidden();
  await form.locator('[data-enquiry-example]').first().focus();
  await page.keyboard.press('Enter');
  await expect(form).toHaveAttribute('data-typing-example', 'true');
  await expect(form.locator('.enquiry-details')).toBeVisible();
  await expect(form.locator('[name=message]')).toBeFocused();
  await form.locator('[name=message]').fill('A');
  await expect(form.locator('.enquiry-details')).toBeVisible();
  await form.locator('[name=message]').fill('');
  await expect(form.locator('.enquiry-details')).toBeVisible();
  await form.locator('[name=message]').fill('Test problem');
  await form.locator('[type=submit]').click();
  await expect(form.locator('[name=phone]')).toBeFocused();
  await expect(form.locator('[name=phone]')).toHaveAttribute('aria-invalid', 'true');
  await form.locator('[name=phone]').fill('@qa_test');
  await page.route('**/api/contact', async route => {
    expect(route.request().postDataJSON().name).toBe('');
    await route.fulfill({ json: { success: true, leadId: 'qa', message: 'QA accepted' } });
  });
  await form.locator('[type=submit]').click();
  await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
});

for (const route of ['', 'serwis-monitoringu/']) {
  for (const width of [768, 900, 1199, 1200]) {
    test(`enquiry order, heading and choices /ru/${route} at ${width}`, async ({ page }) => {
      await prepare(page, 'ru');
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/ru/' + route);
      const form = page.locator(route ? '#final-form' : '#hero-form');
      const panel = form.locator('..');
      await expect(panel.locator('h2')).toHaveCount(1);
      const heading = form.getByRole('heading', { level: 2, name: 'Что случилось?', exact: true });
      await expect(heading).toBeVisible();
      await expect(heading).toHaveClass('enquiry-title');
      await expect(heading).toHaveCSS('font-size', '18px');
      await expect(heading).toHaveCSS('font-weight', '700');
      await expect(heading).toHaveCSS('margin-bottom', '12px');
      await expect(form.locator('.enquiry-problem label')).toHaveCount(0);
      await expect(form.locator('textarea')).toHaveAttribute('aria-label', 'Что случилось?');
      if (width < 1200) {
        expect(await form.evaluate(el => Boolean(el.closest('.mobile-enquiry-slot')))).toBe(true);
        const call = await page.locator('.preview-hero-call:visible').boundingBox();
        const bounds = await form.boundingBox();
        if (width <= 900) expect(call.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
        else expect(call.y + call.height).toBeLessThan(bounds.y);
        expect(await page.locator('.hero').evaluate(el => el.nextElementSibling.className)).toBe('mobile-enquiry-slot');
      } else expect(await form.evaluate(el => Boolean(el.closest('.preview-contact-rail, .preview-service-rail')))).toBe(true);
      const example = form.locator('[data-enquiry-example]').first();
      const text = await example.textContent();
      await selectExample(example);
      await expect(form).toHaveAttribute('data-typing-example', 'true');
      await expect(form.locator('.enquiry-details')).toBeVisible();
      await expect(form.locator('textarea')).toHaveValue(text);
      await expect(form).not.toHaveAttribute('data-typing-example');
      const labels = form.locator('[name=requestType]').locator('..');
      if (width < 1200) {
        const first = await labels.nth(0).boundingBox();
        const second = await labels.nth(1).boundingBox();
        // Subpixel movement during the inherited entrance animation is not a new row.
        expect(Math.abs(first.y - second.y)).toBeLessThan(1);
      }
      await expect(form.locator('.enquiry-urgency .enquiry-choice')).toHaveText(['Срочно', 'В ближайшее время', 'Сроки не горящие']);
      await expect(form.locator('.enquiry-urgency svg')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

test('an early submit finishes the selected example instead of sending partial text', async ({ page }) => {
  await prepare(page, 'pl');
  await page.goto('/');
  const form = page.locator('#hero-form');
  const example = form.locator('[data-enquiry-example]').first();
  const text = await example.textContent();
  await selectExample(example);
  await form.locator('[name=phone]').fill('@qa_test');
  await page.route('**/api/contact', async route => {
    expect(route.request().postDataJSON().message).toBe(text);
    await route.fulfill({ json: { success: true, leadId: 'qa', message: 'QA accepted' } });
  });
  await form.locator('[type=submit]').click();
  await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
});

for (const lang of ['pl', 'ru', 'uk', 'en']) {
  for (const width of [390, 1440]) {
    test(`compact popup ${lang} at ${width}`, async ({ page }) => {
      await prepare(page, lang);
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${lang === 'pl' ? '/' : '/' + lang + '/'}serwis-monitoringu/`);
      const opener = page.locator('.hero-cta-wrapper a[href="#contact"]');
      await opener.click();
      const form = page.locator('#quick-form');
      await expect(form).toHaveAttribute('data-compact-form');
      await expect(form.locator('[name=message]')).toBeVisible();
      await expect(form.locator('[name=phone]')).toBeVisible();
      await expect(form.locator('[type=submit]')).toBeVisible();
      await expect(form.locator('.enquiry-examples, .enquiry-details, [name=requestType], [name=urgency]')).toHaveCount(0);
      await expect(form.locator('[name=name]')).toBeHidden();
      await expect(form.locator('[name=address]')).toBeHidden();
      await form.locator('[type=submit]').click();
      await expect(form.locator('[name=message]')).toBeFocused();
      let sent = 0;
      await page.route('**/api/contact', async route => {
        const payload = route.request().postDataJSON();
        expect(payload).toMatchObject({ contactFlow: 'compact', formType: 'quick-form', lang, message: 'Local QA only', phone: '+48 500 000 000', name: sent ? 'Я' : '', address: sent ? 'Warszawa' : '' });
        sent++;
        await route.fulfill({ json: { success: true, message: 'QA accepted', leadId: 'local-popup-' + sent } });
      });
      for (const extras of [false, true]) {
        await form.locator('[name=message]').fill('Local QA only');
        await form.locator('[name=phone]').fill('+48 500 000 000');
        if (extras) {
          await form.locator('.enquiry-extras summary').click();
          await form.locator('[name=name]').fill('Я');
          await form.locator('[name=address]').fill('Warszawa');
        }
        await form.locator('[type=submit]').click();
        await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
        await expect(form.locator('[name=message]')).toHaveValue('');
        await expect(form.locator('[name=phone]')).toBeVisible();
        await expect(form.locator('.enquiry-extras')).not.toHaveAttribute('open');
      }
      expect(sent).toBe(2);
      await page.keyboard.press('Escape');
      await expect(page.locator('#quick-contact-modal')).toBeHidden();
      await expect(opener).toBeFocused();
      await expect(page.locator('#final-form .enquiry-details')).toBeHidden();
    });
  }
}
