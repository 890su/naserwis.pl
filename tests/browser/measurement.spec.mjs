import { test, expect } from '@playwright/test';

const labels = {
  lead: 'AW-18394870871/WpLcCOaejeMcENforcNE',
  phone: 'AW-18394870871/kLzqCNjw8uscENforcNE',
  whatsapp: 'AW-18394870871/9W2RCNvw8uscENforcNE',
  telegram: 'AW-18394870871/OTU7CN7w8uscENforcNE',
  chatwoot: 'AW-18394870871/LFeICJj-_escENforcNE'
};
const contactSelector = 'a[href^="tel:"], a[href*="wa.me/"], a[href*="t.me/"]';
const events = (page, name) => page.evaluate(n => window.dataLayer.filter(item => item.event === n), name);
const conversions = page => page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event' && item[1] === 'conversion').map(item => item[2]));

async function setup(page, baseURL, preferences = { analytics: true, marketing: true }) {
  await page.addInitScript(p => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, support: false, ...p }));
  }, preferences);
  // Production-safe too: no external tags, calls/messages, reviews or real API delivery.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL).origin) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 503, json: { success: false, message: 'QA: no delivery' } });
    return route.continue();
  });
}

async function fill(form) {
  await form.locator('[name="message"]').fill('Private QA message');
  if (await form.locator('.enquiry-extras summary').count()) await form.locator('.enquiry-extras summary').click();
  await form.locator('[name="name"]').fill('Private QA Person');
  await form.locator('[name="phone"]').fill('+48 000 000 999');
}

const locales = [
  ['', 'pogoda-internet-warszawa/'], ['ru/', 'pogoda-internet-varshava/'],
  ['uk/', 'pohoda-internet-varshava/'], ['en/', 'weather-internet-warsaw/']
];
for (const [locale, weather] of locales) {
  test(`popup launchers and alternative contact channels /${locale}`, async ({ page, baseURL }) => {
    // This scenario opens every launcher across four page/viewport combinations.
    test.setTimeout(90000);
    await setup(page, baseURL);
    for (const section of ['', 'naprawa-wifi/']) {
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/' + locale + section);
        const launchers = page.locator('a[href="#contact"], [data-contact-modal]');
        let opened = 0;
        for (const opener of await launchers.all()) {
          const region = await opener.evaluate(element => element.closest('.fab-menu') ? 'floating'
            : element.closest('.mobile-menu-overlay') ? 'mobile_menu' : 'page');
          if (region === 'mobile_menu') {
            if (width !== 390) continue;
            await page.locator('#mobile-menu-toggle').click();
          } else if (region === 'floating') {
            await page.locator('.fab-toggle').click();
          }
          if (region !== 'page') await expect(opener).toBeVisible();
          if (!await opener.isVisible()) continue;
          const before = (await events(page, 'naserwis_cta_click')).length;
          await opener.click();
          await expect(page.locator('#quick-contact-modal')).toBeVisible();
          expect(await events(page, 'naserwis_cta_click')).toHaveLength(before + 1);
          expect(await conversions(page)).toHaveLength(0);
          await page.keyboard.press('Escape');
          opened++;
        }
        expect(opened).toBeGreaterThanOrEqual(width === 390 ? 3 : 2);
        await page.evaluate(() => document.addEventListener('click', event => {
          if (event.target.closest('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me/"], a[href*="t.me/"]')) event.preventDefault();
        }, true));
        for (const method of ['phone', 'whatsapp', 'telegram']) {
          const selector = method === 'phone' ? '[href^="tel:"]' : method === 'whatsapp' ? '[href*="wa.me/"]' : '[href*="t.me/"]';
          await page.locator('.contact-alternatives ' + selector).first().click();
          expect((await events(page, method + '_click')).at(-1)).toMatchObject({ contact_method: method, contact_placement: 'form' });
        }
        await page.locator('footer a[href^="mailto:"]').first().click();
        expect(await events(page, 'email_click')).toMatchObject([{ contact_method: 'email', contact_placement: 'footer' }]);
        expect((await conversions(page)).map(event => event.send_to)).toEqual([labels.phone, labels.whatsapp, labels.telegram]);
        expect(await events(page, 'generate_lead')).toHaveLength(0);
        const layer = await page.evaluate(() => JSON.stringify(window.dataLayer));
        expect(layer).not.toContain('iharshastsiuk@gmail.com');
      }
    }
  });

  for (const section of ['', 'naprawa-wifi/', 'naprawa-sieci/', 'montaz-sieci/', weather,
    'poradnik/', 'poradnik/jak-wzmocnic-sygnal-wifi-w-domu/', 'poradnik/siec-lan-w-domu-przed-remontem/']) {
    test(`contact inventory and every lead form /${locale}${section}`, async ({ page, baseURL }) => {
      await setup(page, baseURL);
      await page.goto('/' + locale + section);
      await page.evaluate(selector => {
        document.addEventListener('click', event => {
          if (event.target.closest(selector)) event.preventDefault();
        }, true);
      }, contactSelector);
      const methods = await page.locator(contactSelector).evaluateAll(links => links.map(link => {
        link.click();
        return link.getAttribute('href').startsWith('tel:') ? 'phone' : link.href.includes('wa.me/') ? 'whatsapp' : 'telegram';
      }));
      expect(methods.length).toBeGreaterThan(0);
      expect((await conversions(page)).map(event => event.send_to)).toEqual(methods.map(method => labels[method]));
      expect(await events(page, 'naserwis_contact_click')).toHaveLength(methods.length);
      for (const method of ['phone', 'whatsapp', 'telegram']) {
        expect(await events(page, method + '_click')).toHaveLength(methods.filter(value => value === method).length);
      }

      const forms = await page.locator('form:not(#review-form)').evaluateAll(nodes => nodes.map(node => node.id));
      let successful = 0;
      let requests = 0;
      await page.route('**/api/contact', async route => {
        requests++;
        const formId = route.request().postDataJSON().formType;
        const failed = requests % 2 === 1;
        await route.fulfill({ status: failed ? 502 : 200, json: failed
          ? { success: false, message: 'QA rejected' }
          : { success: true, message: 'QA accepted', leadId: `qa-${formId}` } });
      });
      for (const id of forms) {
        expect(['hero-form', 'final-form', 'quick-form']).toContain(id);
        if (id === 'quick-form') {
          await page.locator('.fab-toggle').click();
          await page.locator('.fab-form').click();
        }
        const form = page.locator('#' + id);
        await fill(form);
        await form.locator('[type="submit"]').click();
        await expect(page.locator('#' + id + '-message')).toHaveText('QA rejected');
        expect(await events(page, 'generate_lead')).toHaveLength(successful);
        await form.locator('[type="submit"]').click();
        await expect(page.locator('#' + id + '-message')).toHaveText('QA accepted');
        successful++;
        const placement = id === 'quick-form' ? 'modal' : id === 'hero-form' ? 'contact_rail' : section === '' ? 'final' : 'service_rail';
        expect((await events(page, 'naserwis_form_success')).at(-1)).toMatchObject({ form_id: id, placement });
        expect((await events(page, 'naserwis_form_start')).filter(event => event.form_id === id)).toHaveLength(1);
        if (id === 'quick-form') await page.keyboard.press('Escape');
      }
      expect(await events(page, 'generate_lead')).toHaveLength(forms.length);
      expect(await events(page, 'naserwis_lead_submit')).toHaveLength(forms.length);
      const leadConversions = (await conversions(page)).filter(event => event.send_to === labels.lead);
      expect(leadConversions.map(event => event.transaction_id)).toEqual(forms.map(id => `qa-${id}`));
      const layer = await page.evaluate(() => JSON.stringify(window.dataLayer));
      for (const pii of ['Private QA Person', '+48 000 000 999', 'Private QA message']) expect(layer).not.toContain(pii);
    });
  }

  test(`task cards, pricing and mobile contact placements /${locale}`, async ({ page, baseURL }) => {
    await setup(page, baseURL);
    await page.goto('/' + locale);
    await page.evaluate(() => document.addEventListener('click', event => {
      if (event.target.closest('a')) event.preventDefault();
    }, true));
    const choices = ['wifi-coverage', 'router-setup', 'lan-install', 'lan-repair', 'network-test', 'device-setup'];
    await page.locator('.home-services-details > summary').click();
    for (const choice of choices) {
      await page.locator(`.preview-task-link[data-service-choice="${choice}"]`).click();
      expect((await events(page, 'naserwis_service_select')).at(-1)).toMatchObject({
        service_choice: choice, placement: 'task_panel', task_group: ['wifi-coverage', 'lan-repair', 'network-test'].includes(choice) ? 'fault' : 'setup'
      });
      await page.locator(`.home-service-link[data-service-choice="${choice}"]`).click();
      expect((await events(page, 'naserwis_service_select')).at(-1)).toMatchObject({ service_choice: choice, placement: 'services' });
    }
    expect(await events(page, 'naserwis_service_select')).toHaveLength(12);
    await page.locator('.preview-conditions-link').click();
    expect(await events(page, 'naserwis_pricing_click')).toMatchObject([{ placement: 'pricing' }]);
    expect(await conversions(page)).toHaveLength(0);
    await page.locator('#header .header-nav-link[href$="#contact"]').click();
    expect((await events(page, 'naserwis_cta_click')).at(-1)).toMatchObject({ placement: 'header', action: 'form' });
    expect(await events(page, 'naserwis_service_select')).toHaveLength(12);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    expect((await events(page, 'naserwis_cta_view')).filter(event => event.placement === 'mobile_menu')).toHaveLength(0);
    for (const selector of ['.mobile-call-btn', '.mobile-channel[href*="wa.me/"]', '.mobile-channel[href*="t.me/"]']) {
      await page.locator('#mobile-menu-toggle').click();
      await page.locator(selector).click();
      expect((await events(page, 'naserwis_contact_click')).at(-1)).toMatchObject({ contact_placement: 'mobile_menu' });
    }
    expect((await conversions(page)).map(event => event.send_to)).toEqual([labels.phone, labels.whatsapp, labels.telegram]);
    await page.locator('#mobile-menu-toggle').click();
    await page.locator('.mobile-channel[data-contact-modal]').click();
    await expect(page.locator('#quick-contact-modal')).toBeVisible();
    expect((await events(page, 'naserwis_cta_click')).at(-1)).toMatchObject({ placement: 'mobile_menu', action: 'form' });
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  });
}

for (const [analytics, marketing] of [[false, false], [true, false], [false, true], [true, true]]) {
  test(`consent categories gate new diagnostics and existing conversions ${analytics}/${marketing}`, async ({ page, baseURL }) => {
    await setup(page, baseURL, { analytics, marketing });
    await page.goto('/?name=DO-NOT-TRACK&gclid=private-click-id');
    await page.evaluate(() => document.addEventListener('click', event => {
      if (event.target.closest('a')) event.preventDefault();
    }, true));
    await page.locator('.preview-task-link').first().click();
    await page.locator('.hero .preview-hero-call').click();
    await page.locator('footer a[href^="mailto:"]').first().click();
    await page.locator('.hero [data-contact-modal]').click();
    await fill(page.locator('#quick-form'));
    await page.route('**/api/contact', route => route.fulfill({ json: { success: true, message: 'QA accepted', leadId: 'qa-consent' } }));
    await page.locator('#quick-form [type="submit"]').click();
    await expect(page.locator('#quick-form-message')).toHaveText('QA accepted');
    expect(await events(page, 'naserwis_service_select')).toHaveLength(analytics ? 1 : 0);
    expect(await events(page, 'naserwis_cta_click')).toHaveLength(analytics ? 1 : 0);
    expect((await conversions(page)).map(event => event.send_to)).toEqual(marketing ? [labels.phone, labels.lead] : []);
    const ga = await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event' && item[1] !== 'conversion').map(item => item[1]));
    expect(ga.filter(name => name === 'generate_lead')).toHaveLength(analytics ? 1 : 0);
    expect(ga.filter(name => name === 'email_click')).toHaveLength(analytics ? 1 : 0);
    const layer = await page.evaluate(() => JSON.stringify(window.dataLayer));
    expect(layer).not.toContain('DO-NOT-TRACK');
    expect(layer).not.toContain('private-click-id');
  });
}

test('SDK chat opening emits exactly one secondary action and never a lead', async ({ page, baseURL }) => {
  await setup(page, baseURL, { analytics: true, marketing: true, support: true });
  await page.addInitScript(() => { window.$chatwoot = { toggle() {} }; });
  await page.goto('/');
  await page.locator('.fab-toggle').click();
  await page.locator('.fab-chat').click();
  expect(await events(page, 'chatwoot_open')).toHaveLength(1);
  expect((await conversions(page)).map(event => event.send_to)).toEqual([labels.chatwoot]);
  expect(await events(page, 'generate_lead')).toHaveLength(0);
});

test('opening a service contact form is not counted as another service selection', async ({ page, baseURL }) => {
  await setup(page, baseURL);
  await page.goto('/naprawa-wifi/');
  await page.locator('.preview-final-actions [data-contact-modal]').click();
  await expect(page.locator('#quick-contact-modal')).toBeVisible();
  expect(await events(page, 'naserwis_cta_click')).toHaveLength(1);
  expect(await events(page, 'naserwis_service_select')).toHaveLength(0);
});

test('desktop service menu records its destination before native navigation', async ({ page, baseURL }) => {
  await setup(page, baseURL);
  await page.addInitScript(() => addEventListener('beforeunload', () => {
    sessionStorage.setItem('qa-service-navigation', JSON.stringify(window.dataLayer.filter(item => item.event === 'naserwis_service_select')));
  }));
  await page.goto('/ru/');
  await page.locator('.services-btn').click();
  await page.locator('.services-menu button[onclick*="naprawa-wifi"]').click();
  await page.waitForURL('**/ru/naprawa-wifi/');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('qa-service-navigation')))).toMatchObject([
    { target_service: 'wifi_repair', placement: 'header', language: 'ru' }
  ]);
});

test('an incomplete response and repeated in-flight submit cannot create false or duplicate leads', async ({ page, baseURL }) => {
  await setup(page, baseURL);
  await page.goto('/');
  let requests = 0;
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/api/contact', async route => {
    requests++;
    if (requests === 1) return route.fulfill({ json: { success: true, message: 'Missing lead ID' } });
    await pending;
    return route.fulfill({ json: { success: true, message: 'QA accepted once', leadId: 'qa-once' } });
  });
  const form = page.locator('#hero-form');
  await fill(form);
  await form.locator('[type="submit"]').click();
  await expect(page.locator('#hero-form-message')).toHaveText('Missing lead ID');
  expect(await conversions(page)).toHaveLength(0);
  await form.evaluate(element => { element.requestSubmit(); element.requestSubmit(); });
  await expect.poll(() => requests).toBe(2);
  release();
  await expect(page.locator('#hero-form-message')).toHaveText('QA accepted once');
  expect(await events(page, 'generate_lead')).toHaveLength(1);
  expect(await conversions(page)).toEqual([{ send_to: labels.lead, transaction_id: 'qa-once' }]);
});

test('granting consent does not replay earlier clicks; visible phone impressions count once', async ({ page, baseURL }) => {
  await setup(page, baseURL, { analytics: false, marketing: false });
  await page.goto('/');
  await page.evaluate(() => document.addEventListener('click', event => {
    if (event.target.closest('a')) event.preventDefault();
  }, true));
  await page.locator('.preview-task-link').first().click();
  expect(await events(page, 'naserwis_service_select')).toHaveLength(0);
  await page.locator('[data-consent-settings]').click();
  await page.locator('.consent-options [name="analytics"]').check();
  await page.locator('.consent-save').click();
  expect(await events(page, 'naserwis_service_select')).toHaveLength(0);
  await page.locator('.preview-task-link').first().click();
  expect(await events(page, 'naserwis_service_select')).toHaveLength(1);
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await events(page, 'naserwis_cta_view')).filter(event => event.placement === 'hero' && event.action === 'phone').length).toBe(1);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.locator('.hero').scrollIntoViewIfNeeded();
  expect((await events(page, 'naserwis_cta_view')).filter(event => event.placement === 'hero' && event.action === 'phone')).toHaveLength(1);
});
