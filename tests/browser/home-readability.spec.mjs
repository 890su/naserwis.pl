import { test, expect } from '@playwright/test';

for (const prefix of ['', 'ru/', 'uk/', 'en/']) {
  test(`homepage service fragments reveal details /${prefix}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
    await page.goto('/' + prefix + '#available-services');
    await expect(page.locator('.home-services-details')).toHaveAttribute('open', '');
    await expect(page.locator('#available-services')).toBeVisible();
    await page.locator('.home-services-details > summary').click();
    await page.locator('.home-pricing-details > summary').click();
    await page.locator('.home-catalog-back').click();
    await expect(page.locator('.home-services-details')).toHaveAttribute('open', '');
    await expect.poll(async () => (await page.locator('#available-services').boundingBox()).y).toBeGreaterThanOrEqual(60);
  });
  for (const width of [320, 390, 768, 1440]) {
    test(`homepage progressive details /${prefix} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false })));
      await page.route(/googletagmanager|google-analytics|chatwoot|ai\.czait\.pl/, route => route.abort());
      await page.goto('/' + prefix);
      await expect(page.locator('main > section:not(.mobile-enquiry-slot)')).toHaveCount(7);
      await expect(page.locator('#services')).toHaveCount(1);
      await expect(page.locator('.home-pricing-rates .preview-rate')).toHaveCount(3);
      const pricePrefix = { '': 'od', 'ru/': 'от', 'uk/': 'від', 'en/': 'from' }[prefix];
      const currency = prefix === 'en/' ? 'PLN' : 'zł';
      await expect(page.locator('.home-pricing-rates .preview-rate strong')).toHaveText([200, 250, 150].map(amount => `${pricePrefix} ${amount} ${currency}`));
      await expect(page.locator('.home-disclosure')).toHaveCount(3);
      await expect(page.locator('.billing-rule')).toBeHidden();
      await expect(page.locator('.home-service-catalog')).toBeHidden();
      await expect(page.locator('#hero-form')).toBeVisible();
      await expect(page.locator('footer a[hreflang]')).toHaveCount(0);
      await expect(page.locator('#header a[hreflang]')).not.toHaveCount(0);
      const business = page.locator('.preview-business-link');
      await expect(business).toBeVisible();
      await expect(business).toHaveAttribute('href', '/' + prefix + 'dla-firm/');
      await expect(business).not.toHaveAttribute('target', '_blank');
      await expect(business).not.toHaveAttribute('data-service-choice');
      await expect(page.locator('.home-services-details .home-scope')).toHaveCount(0);
      await expect(page.locator('.home-more > .container > h2')).toBeVisible();
      await expect(page.locator('.home-service-catalog h2')).toHaveCount(0);
      await expect(page.locator('.home-more > .container > details')).toHaveCount(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

      const pricing = page.locator('.home-pricing-details');
      await pricing.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(pricing).toHaveAttribute('open', '');
      await expect(page.locator('.billing-rule')).toBeVisible();
      await expect(page.locator('.home-billing .price-row[role=row]')).toHaveCount(0);
      await expect(page.locator('.home-billing .price-table, .home-billing h2')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.keyboard.press('Space');
      await expect(pricing).not.toHaveAttribute('open');

      await page.locator('.home-services-details > summary').click();
      await expect(page.locator('.home-service-link')).toHaveCount(6);
      await expect(page.locator('.home-service-link').first()).toBeVisible();
      await expect(page.locator('.problems')).toBeVisible();
      await expect(page.locator('.why-us')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.locator('.home-services-details > summary').click();
      await expect(page.locator('.home-service-catalog')).toBeHidden();

      await page.locator('.home-business-details > summary').click();
      await expect(page.locator('.business-handoff')).toBeVisible();
      const businessServices = page.locator('.home-business-links a');
      await expect(businessServices).toHaveCount(5);
      for (const link of await businessServices.all()) {
        await expect(link).not.toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('href', new RegExp('^/' + prefix + 'dla-firm/'));
      }
      await expect(page.locator('.business-handoff h2')).toHaveCount(0);
      expect(await page.locator('.home-more').evaluate(e => getComputedStyle(e).backgroundColor))
        .not.toBe(await page.locator('.reviews').evaluate(e => getComputedStyle(e).backgroundColor));
      const contact = page.locator('.home-contact-cta');
      await contact.scrollIntoViewIfNeeded();
      await expect(contact.locator('form, textarea')).toHaveCount(0);
      await expect(contact.locator('.btn')).toHaveCount(2);
      await expect(contact.locator('a[href="tel:+48453327678"]')).toBeVisible();
      expect(await contact.evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgb(243, 245, 247)');
      await contact.locator('[data-contact-modal]').click();
      await expect(page.locator('#quick-contact-modal')).toBeVisible();
      await expect(page.locator('#quick-form textarea')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#quick-contact-modal')).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}
