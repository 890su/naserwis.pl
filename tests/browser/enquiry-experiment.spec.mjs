import { expect, test } from '@playwright/test';

const storageKey = 'naserwis_enquiry_ab_v1';
const consentKey = 'naserwis_consent_v1';
const consent = { version: 1, analytics: true, marketing: true, support: false };
const events = page => page.evaluate(() => window.dataLayer
  .filter(entry => entry[0] === 'event')
  .map(entry => [entry[1], entry[2]]));

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager|google-analytics|googleadservices|googlesyndication|ai\.czait\.pl/, route => route.abort());
});

for (const variant of ['simple', 'staged']) {
  test(`${variant} form keeps its assignment and records only confirmed leads`, async ({ page }) => {
    await page.addInitScript(({ storageKey, consentKey, consent, variant }) => {
      if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, variant);
      localStorage.setItem(consentKey, JSON.stringify(consent));
      localStorage.setItem('preferredLanguage', 'pl');
    }, { storageKey, consentKey, consent, variant });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/naprawa-wifi/');
    await expect(page.locator('#final-form')).toHaveAttribute('data-enquiry-variant', variant);
    await page.goto('/');
    await page.reload();
    const form = page.locator('#hero-form');
    await expect(form).toHaveAttribute('data-enquiry-variant', variant);
    await form.locator('h2').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await events(page)).filter(([name]) => name === `naserwis_ab_${variant}_view`).length).toBe(1);
    const phone = form.locator('[name=phone]');
    if (variant === 'simple') {
      await expect(form.getByLabel('Telefon kontaktowy')).toHaveAttribute('type', 'tel');
      await expect(form.getByLabel('Co się stało?')).toBeVisible();
      await expect(phone).toBeVisible();
      await expect(form.locator('.enquiry-examples, [name=requestType], [name=urgency]')).toHaveCount(0);
      await expect(form.locator('.enquiry-extras')).not.toHaveAttribute('open');
    } else {
      await expect(form.getByRole('button', { name: 'Zostaw zgłoszenie', exact: true })).toBeVisible();
      await expect(phone).toBeHidden();
    }
    await form.locator('[name=message]').fill('Problem z siecią podczas testu');
    await phone.fill('+48 500 000 000');
    let attempts = 0;
    await page.route('**/api/contact', async route => {
      expect(route.request().postDataJSON()).toMatchObject({
        formType: 'hero-form', contactFlow: variant === 'simple' ? 'compact' : 'staged', name: '',
        phone: '+48 500 000 000', message: 'Problem z siecią podczas testu'
      });
      attempts++;
      await route.fulfill(attempts === 1
        ? { status: 503, json: { success: false, message: 'QA retry' } }
        : { json: { success: true, leadId: 'ab-test-local', message: 'QA accepted' } });
    });
    const send = form.locator('button[type=submit]');
    await send.click();
    await expect(form.locator('[role=alert]')).toHaveText('QA retry');
    expect((await events(page)).filter(([name]) => name === 'conversion' || name.endsWith('_lead'))).toHaveLength(0);
    await send.click();
    await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
    const measured = await events(page);
    expect(measured.filter(([name]) => name === 'conversion')).toHaveLength(1);
    expect(measured.filter(([name]) => name === 'generate_lead')).toHaveLength(1);
    expect(measured.filter(([name]) => name === `naserwis_ab_${variant}_view`)).toHaveLength(1);
    expect(measured.filter(([name]) => name.endsWith('_lead') && name.startsWith('naserwis_ab_'))).toEqual([
      [`naserwis_ab_${variant}_lead`, {
        send_to: 'G-FVC64PTKR3', form_id: 'hero-form', placement: 'contact_rail', language: 'pl', page_path: '/'
      }]
    ]);
  });
}

test('first visit preserves the displayed form when analytics is accepted', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.2; });
  await page.goto('/');
  const form = page.locator('#hero-form');
  await expect(form).toHaveAttribute('data-enquiry-variant', 'simple');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect((await events(page)).filter(([name]) => name.startsWith('naserwis_ab_'))).toHaveLength(0);
  await page.locator('.consent-accept').click();
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('simple');
  await expect(form).toHaveAttribute('data-enquiry-variant', 'simple');
  await page.goto('/en/naprawa-wifi/');
  await expect(page.locator('#final-form')).toHaveAttribute('data-enquiry-variant', 'simple');
});

test('visitors who declined analytics use the existing form outside the experiment', async ({ page }) => {
  await page.addInitScript(({ consentKey, consent }) => localStorage.setItem(consentKey, JSON.stringify({ ...consent, analytics: false })), { consentKey, consent });
  await page.goto('/');
  await expect(page.locator('#hero-form')).toHaveAttribute('data-staged-form', '');
  await expect(page.locator('#hero-form')).not.toHaveAttribute('data-enquiry-variant');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect((await events(page)).filter(([name]) => name.startsWith('naserwis_ab_'))).toHaveLength(0);
});

test('the collection window ends with the published staged form', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-12-10T12:00:00+01:00'));
  await page.addInitScript(({ storageKey, consentKey, consent }) => {
    localStorage.setItem(consentKey, JSON.stringify(consent));
    localStorage.setItem(storageKey, 'simple');
  }, { storageKey, consentKey, consent });
  await page.goto('/');
  await expect(page.locator('#hero-form')).toHaveAttribute('data-staged-form', '');
  await expect(page.locator('#hero-form')).not.toHaveAttribute('data-enquiry-variant');
});
