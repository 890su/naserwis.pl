import { test, expect } from '@playwright/test';
import { businessCopy } from '../../scripts/business-copy.mjs';
import { businessPath } from '../../scripts/business-links.mjs';

async function prepare(page, locale) {
  await page.addInitScript(lang => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('preferredLanguage', lang);
    localStorage.setItem('naserwis_consent_v1', JSON.stringify({version:1,analytics:false,marketing:false,support:false}));
  }, locale);
  await page.route(/(?:google|facebook|chatwoot|czait)\./, route => route.abort());
}

for (const [locale, c] of Object.entries(businessCopy)) {
  for (const [slug, service] of [['', c.hub], ...Object.entries(c.services)]) {
    test(`business content and request context ${locale}/${slug || 'hub'}`, async ({ page }) => {
      await prepare(page, locale);
      await page.goto(businessPath(locale, slug));
      await expect(page.locator('h1')).toContainText(service.h1);
      const form = page.locator('#final-form');
      await expect(form.locator('[name=message]')).toBeVisible();
      await expect(form.locator('[data-enquiry-example]:not([data-example-clone])')).toHaveCount(service.examples.length);
      await form.locator('[data-examples-all]').click();
      const example = form.locator('[data-enquiry-example]:not([data-example-clone])').first();
      await example.locator('.enquiry-example-text').click();
      await expect(form.locator('[name=message]')).toHaveValue(service.examples[0]);
      await expect(form.locator('.enquiry-details')).toBeVisible();
      await expect(page.locator('.business-menu a[href^="http"]')).toHaveCount(0);
      await expect(page.locator('.footer-business a[href^="http"]')).toHaveCount(0);
      await expect(page.locator(`.business-breadcrumbs [aria-current=page]`)).toHaveText(service.nav);
      for (const lang of ['pl','ru','uk','en']) {
        await expect(page.locator(`.desktop-nav a[data-lang="${lang}"]`)).toHaveAttribute('href', businessPath(lang, slug));
      }
    });
  }
  test(`business request retry and source ${locale}`, async ({ page }) => {
    await prepare(page, locale);
    const path = businessPath(locale, 'wifi');
    await page.goto(path + '?utm_source=qa-business&utm_medium=test');
    const form = page.locator('#final-form');
    const message = c.services.wifi.examples[0];
    await form.locator('[name=message]').fill(message);
    await form.locator('[name=phone]').fill('qa-business@example.test');
    let attempts = 0;
    await page.route('**/api/contact', async route => {
      const data = route.request().postDataJSON();
      expect(data).toMatchObject({lang:locale,message,phone:'qa-business@example.test',contactFlow:'staged'});
      expect(data.attribution.landing_page).toBe(path);
      expect(data.attribution.service).toBe('business_wifi');
      attempts++;
      await route.fulfill({status:attempts === 1 ? 502 : 200,json:attempts === 1 ? {success:false,message:'QA retry'} : {success:true,message:'QA accepted',leadId:'business-local-only'}});
    });
    await form.locator('[type=submit]').click();
    await expect(form.locator('[role=alert]')).toHaveText('QA retry');
    await expect(form.locator('[name=message]')).toHaveValue(message);
    await form.locator('[type=submit]').click();
    await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
    expect(attempts).toBe(2);
  });
}

for (const slug of ['', 'awaria-sieci']) {
  for (const width of [390, 820, 900, 901, 1024, 1440]) {
    test(`business responsive ${slug || 'hub'} ${width}`, async ({ page }) => {
      await prepare(page, 'pl');
      await page.setViewportSize({width,height:1000});
      await page.goto(businessPath('pl', slug));
      await page.evaluate(() => document.fonts.ready);
      const form = page.locator('#final-form');
      await expect(form.locator('[name=message]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      expect(await form.evaluate(el => !!el.closest('.mobile-enquiry-slot'))).toBe(width < 1200);
      const call = page.locator('.preview-hero-call:visible');
      await expect(call).toHaveCount(1);
      const callBounds = await call.boundingBox();
      if (width <= 900) {
        await expect(page.locator('.hero .preview-hero-call')).toBeHidden();
        await expect(form.locator('.contact-alternatives a[href^="tel:"]')).toBeHidden();
        const bounds = await form.boundingBox();
        expect(callBounds.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
        const contentCenter = await call.evaluate(el => {
          const parts = [...el.children].map(child => child.getBoundingClientRect());
          return (parts[0].left + parts.at(-1).right) / 2;
        });
        expect(Math.abs(contentCenter - width / 2)).toBeLessThan(2);
      } else {
        await expect(page.locator('.hero .preview-hero-call')).toBeVisible();
        const title = await page.locator('.hero .hero-text').boundingBox();
        expect(callBounds.x).toBeGreaterThanOrEqual(title.x + title.width);
      }
      if ([390, 820, 901, 1440].includes(width)) await page.screenshot({path:`outputs/business-20261026-${slug || 'hub'}-${width}.png`,fullPage:true});
      await form.locator('[name=message]').fill('Sprawdzenie połączenia w biurze');
      await page.setViewportSize({width:width === 390 ? 1440 : 390,height:1000});
      await expect(form.locator('[name=message]')).toHaveValue('Sprawdzenie połączenia w biurze');
      await page.locator('.hero a[href="#contact"]').click();
      await expect(page.locator('#quick-contact-modal')).toBeVisible();
      await expect(page.locator('#quick-form')).toHaveAttribute('data-compact-form','');
      await page.keyboard.press('Escape');
      await expect(page.locator('#quick-contact-modal')).toBeHidden();
    });
  }
}

test('business form emits the existing primary conversion only after success', async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('naserwis_consent_v1', JSON.stringify({version:1,analytics:true,marketing:true,support:false}));
  });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL).origin) return route.abort();
    if (url.pathname === '/api/contact') return route.fulfill({status:200,json:{success:true,message:'QA accepted',leadId:'business-measurement-only'}});
    return route.continue();
  });
  await page.goto('/dla-firm/awaria-sieci/');
  const form = page.locator('#final-form');
  await form.locator('[name=message]').fill('Nie działa sieć w biurze');
  await form.locator('[name=phone]').fill('qa-measurement@example.test');
  const conversions = () => page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event' && item[1] === 'conversion').map(item => item[2].send_to));
  expect(await conversions()).toEqual([]);
  await form.locator('[type=submit]').click();
  await expect(form.locator('[role=alert]')).toHaveText('QA accepted');
  expect(await conversions()).toEqual(['AW-18394870871/WpLcCOaejeMcENforcNE']);
  expect(await page.evaluate(() => window.dataLayer.filter(item => item.event === 'generate_lead'))).toMatchObject([{service:'business_network'}]);
});
