import { test, expect } from '@playwright/test';

async function consent(page, preferences = {}) {
  await page.addInitScript(p => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false, ...p })), preferences);
}
async function isolate(page) {
  await page.route(/googletagmanager\.com|google-analytics\.com|ai\.czait\.pl|fonts\.googleapis\.com|fonts\.gstatic\.com/, route => route.abort());
}
async function events(page, name) {
  return page.evaluate(n => (window.dataLayer || []).filter(x => x.event === n), name);
}

for (const locale of ['', 'ru/', 'uk/', 'en/']) {
  for (const service of ['', 'montaz-sieci/', 'naprawa-wifi/', 'naprawa-sieci/']) {
    test(`mobile contact and SEO /${locale}${service}`, async ({ page }) => {
      await isolate(page); await consent(page, { analytics: true });
      await page.setViewportSize({ width: 390, height: 700 });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto('/' + locale + service);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel=canonical]')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
      await expect(page.locator('.fab-toggle')).toContainText(/Napisz|Напишите|Напишіть|Message/);
      await page.locator('.fab-toggle').click();
      await expect(page.locator('.fab-menu')).toBeVisible();
      await expect(page.locator('.fab-phone')).toHaveAttribute('href', 'tel:+48453327678');
      await expect(page.locator('.contact-choice-label')).toHaveCount(4);
      await page.keyboard.press('Escape');
      await expect(page.locator('.fab-toggle')).toBeFocused();
      await expect(page.locator('.fab-toggle')).toHaveAttribute('aria-expanded', 'false');
      await page.locator('.service-content, .trust-signals').first().evaluate(e => window.scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
      await expect(page.locator('.contact-bar')).toBeVisible();
      await page.locator('[data-contact-open]').click();
      await expect(page.locator('.fab-menu')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-contact-open]')).toBeFocused();
      await page.locator('#final-form').scrollIntoViewIfNeeded();
      await expect(page.locator('.contact-bar')).toBeHidden();
      expect(errors).toEqual([]);
    });
  }
}

test('consent is non-modal; settings have modal focus; reject never loads chat', async ({ page }) => {
  await isolate(page); await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const panel = page.locator('.consent-panel');
  await expect(panel).toHaveAttribute('role', 'region');
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  await expect(page.locator('.contact-bar')).toBeHidden();
  await expect(page.locator('script[data-chatwoot-loader]')).toHaveCount(0);
  await page.locator('.consent-customise').click();
  await expect(panel).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#main-content')).toHaveAttribute('inert', '');
  await page.locator('.consent-save').focus(); await page.keyboard.press('Tab');
  await expect(page.locator('.consent-close')).toBeFocused();
  await page.locator('.consent-reject').click();
  await expect(page.locator('#consent-dialog')).toBeHidden();
  await expect(page.locator('#main-content')).not.toHaveAttribute('inert');
  await expect(page.locator('script[data-chatwoot-loader]')).toHaveCount(0);
  await page.locator('[data-consent-settings]').click();
  await expect(panel).toHaveAttribute('role', 'dialog');
});

test('form validates locally, preserves errors, counts one success and no PII', async ({ page }) => {
  await isolate(page); await consent(page, { analytics: true, marketing: true });
  await page.goto('/ru/naprawa-wifi/?utm_source=google&gclid=test-click');
  let requests = 0;
  await page.route('**/api/contact', async route => {
    requests++;
    const body = route.request().postDataJSON();
    expect(body.attribution.gclid).toBe('test-click');
    expect(body.formType).toBe('final-form');
    await route.fulfill({ status: requests === 1 ? 502 : 200, contentType: 'application/json', body: JSON.stringify(requests === 1 ? { success: false, message: 'Test delivery error' } : { success: true, message: 'Test accepted', leadId: 'qa-id' }) });
  });
  await page.locator('#final-form button[type=submit]').click();
  expect(requests).toBe(0);
  await expect(page.locator('#final-name')).toBeFocused();
  await page.locator('#final-name').fill('QA Person');
  await page.locator('#final-phone').fill('+48 000 000 000');
  await page.locator('#final-message').fill('Private test message');
  expect((await events(page, 'naserwis_form_start')).length).toBe(1);
  await page.locator('#final-form button[type=submit]').click();
  await expect(page.locator('#final-form-message')).toContainText('Test delivery error');
  await expect(page.locator('#final-message')).toHaveValue('Private test message');
  expect((await events(page, 'naserwis_lead_submit')).length).toBe(0);
  await page.locator('#final-form button[type=submit]').click();
  await expect(page.locator('#final-form-message')).toContainText('Test accepted');
  expect((await events(page, 'naserwis_lead_submit')).length).toBe(1);
  expect((await events(page, 'naserwis_form_success')).length).toBe(1);
  const data = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(data).not.toContain('QA Person'); expect(data).not.toContain('Private test message'); expect(data).not.toContain('+48 000');
  const conversions = await page.evaluate(() => window.dataLayer.filter(x => x[0] === 'event' && x[1] === 'conversion'));
  expect(conversions.length).toBe(1);
  await page.waitForTimeout(5200);
  await expect(page.locator('#final-form-message')).toContainText('Test accepted');
});

test('chat consent grants open once after ready; reject never counts as chat open', async ({ page }) => {
  await isolate(page); await consent(page); await page.goto('/naprawa-sieci/');
  await page.locator('.fab-toggle').click(); await page.locator('.fab-chat').click();
  await expect(page.locator('.consent-panel')).toHaveAttribute('role', 'dialog');
  expect((await events(page, 'chatwoot_open')).length).toBe(0);
  await page.locator('.consent-reject').click();
  await page.locator('.fab-toggle').click(); await page.locator('.fab-chat').click();
  await page.locator('label').filter({ has: page.locator('input[name=support]') }).click();
  await expect(page.locator('input[name=support]')).toBeChecked();
  await page.locator('.consent-save').click();
  await page.evaluate(() => { window.$chatwoot = { toggle: () => {} }; dispatchEvent(new Event('chatwoot:ready')); });
  expect((await events(page, 'chatwoot_open')).length).toBe(1);
  await page.evaluate(() => dispatchEvent(new Event('chatwoot:ready')));
  expect((await events(page, 'chatwoot_open')).length).toBe(1);
});

test('no new diagnostics without analytics, no infinite motion, no overflow', async ({ page }) => {
  await isolate(page); await consent(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/en/montaz-sieci/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.locator('.fab-toggle').click();
    expect((await events(page, 'naserwis_contact_open')).length).toBe(0);
    expect(await page.locator('.fab-toggle').evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  }
});

test('blocked storage does not disable contacts/forms', async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await page.goto('/naprawa-wifi/'); await page.locator('.consent-reject').click();
  await page.locator('.fab-toggle').click();
  await expect(page.locator('.fab-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#final-form button[type=submit]').click();
  await expect(page.locator('#final-name')).toHaveAttribute('aria-invalid', 'true');
});

test('existing contact conversion labels remain single and unchanged', async ({ page }) => {
  await isolate(page); await consent(page, { analytics: true, marketing: true });
  await page.goto('/naprawa-wifi/');
  await page.evaluate(() => document.addEventListener('click', event => {
    if (event.target.closest('a[href^="tel:"], a[href*="wa.me"], a[href*="t.me"]')) event.preventDefault();
  }));
  for (const method of ['phone', 'whatsapp', 'telegram']) {
    await page.locator('.fab-toggle').click(); await page.locator('.fab-' + method).click();
    expect((await events(page, method + '_click')).length).toBe(1);
  }
  const conversions = await page.evaluate(() => window.dataLayer.filter(x => x[0] === 'event' && x[1] === 'conversion').map(x => x[2].send_to));
  expect(conversions).toEqual(['AW-18394870871/kLzqCNjw8uscENforcNE', 'AW-18394870871/9W2RCNvw8uscENforcNE', 'AW-18394870871/OTU7CN7w8uscENforcNE']);
});

test('unavailable chat offers a fallback without a false chat conversion', async ({ page }) => {
  await isolate(page); await consent(page, { support: true }); await page.goto('/naprawa-wifi/');
  await page.clock.install();
  await page.locator('.fab-toggle').click(); await page.locator('.fab-chat').click();
  await page.clock.fastForward(13000);
  await expect(page.locator('.contact-status')).toContainText('chwilowo niedostępny');
  await expect(page.locator('.contact-form-link')).toBeVisible();
  expect((await events(page, 'chatwoot_open')).length).toBe(0);
});

test('visual states and suppression at navigation, keyboard and footer', async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com|ai\.czait\.pl/, route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ru/naprawa-wifi/'); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'outputs/visual/mobile-consent.png', animations: 'disabled' });
  await page.locator('.consent-reject').click();
  await page.locator('.fab-toggle').click();
  await page.screenshot({ path: 'outputs/visual/mobile-contact.png', animations: 'disabled' });
  await page.keyboard.press('Escape');
  await page.locator('.service-content').evaluate(e => window.scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
  await expect(page.locator('.contact-bar')).toBeVisible();
  await page.screenshot({ path: 'outputs/visual/mobile-sticky.png', animations: 'disabled' });
  await page.locator('#mobile-menu-toggle').click(); await expect(page.locator('.contact-bar')).toBeHidden();
  await page.keyboard.press('Escape'); await expect(page.locator('.contact-bar')).toBeVisible();
  await page.locator('#final-name').focus(); await expect(page.locator('.contact-bar')).toBeHidden();
  await page.locator('#final-form').screenshot({ path: 'outputs/visual/mobile-form.png', animations: 'disabled' });
  await page.locator('footer').scrollIntoViewIfNeeded(); await expect(page.locator('.contact-bar')).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/en/naprawa-wifi/');
  await page.locator('.fab-toggle').click();
  await page.screenshot({ path: 'outputs/visual/desktop-contact.png', animations: 'disabled' });
});
