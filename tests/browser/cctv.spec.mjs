import { test, expect } from '@playwright/test';

for (const locale of ['pl', 'ru', 'uk', 'en']) {
  for (const width of [320, 768, 1280, 1920]) {
    test(`combined CCTV page ${locale} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(language => {
        localStorage.setItem('preferredLanguage', language);
        localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false }));
      }, locale);
      const prefix = locale === 'pl' ? '/' : `/${locale}/`;
      let submitted = 0;
      await page.route('**/api/contact', async route => {
        const payload = route.request().postDataJSON();
        expect(payload.lang).toBe(locale);
        expect(payload.message).toContain('CCTV');
        submitted++;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, leadId: 'cctv-mock-only' }) });
      });
      await page.goto(`${prefix}serwis-monitoringu/`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('body')).toHaveAttribute('data-redesign', 'service');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://naserwis.pl${prefix}serwis-monitoringu/`);
      await expect(page.locator('head link[hreflang]')).toHaveCount(5);
      await expect(page.locator('#header .mobile-lang-options a[href$="serwis-monitoringu/"]')).toHaveCount(4);
      await expect(page.locator('.cctv-symptom')).toHaveCount(6);
      const symptom = page.locator('.cctv-symptom').first();
      await expect(symptom.locator('p')).toBeVisible();
      await expect(page.locator('.cctv-symptom summary, .faq-container details')).toHaveCount(0);
      await expect(page.locator('.faq-answer').first()).toBeVisible();
      await expect(page.locator('.cctv-install-steps li')).toHaveCount(3);
      await expect(page.locator('.home-billing .price-item')).toHaveCount(3);
      await expect(page.locator('.cctv-business a')).toHaveAttribute('href', `${prefix}dla-firm/monitoring/`);
      await expect(page.locator('.cctv-business a')).not.toHaveAttribute('target', '_blank');
      await expect(page.locator('#final-form')).toHaveCount(1);
      const structured = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(n => JSON.parse(n.textContent)));
      const service = structured.find(s => s['@type'] === 'Service');
      expect(service.url).toBe(`https://naserwis.pl${prefix}serwis-monitoringu/`);
      const faq = structured.find(s => s['@type'] === 'FAQPage');
      const questions = await page.locator('.faq-question').allTextContents();
      expect(faq.mainEntity.map(q => q.name)).toEqual(questions);
      expect(faq.mainEntity.map(q => q.acceptedAnswer.text)).toEqual(await page.locator('.faq-answer').allTextContents());
      if (width === 1280) {
        await page.locator('#final-message').fill('CCTV test: one camera offline in Warsaw.');
        await page.locator('#final-form .enquiry-extras summary').click();
        await page.locator('#final-name').fill('CCTV Test');
        await page.locator('#final-phone').fill('+48 500 000 000');
        await page.locator('#final-form button[type="submit"]').click();
        await expect.poll(() => submitted).toBe(1);
      }
    });
  }
}
