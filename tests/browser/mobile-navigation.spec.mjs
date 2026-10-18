import { test, expect } from '@playwright/test';

for (const locale of ['pl', 'ru', 'uk', 'en']) {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
    test(`compact mobile navigation ${locale} at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(language => {
        localStorage.setItem('preferredLanguage', language);
        localStorage.setItem('naserwis_consent_v1', JSON.stringify({ version: 1, analytics: false, marketing: false, support: false }));
      }, locale);
      await page.route(/googletagmanager|google-analytics|clarity|tawk/, route => route.abort());
      const prefix = locale === 'pl' ? '/' : `/${locale}/`;
      await page.goto(prefix);

      const languages = page.locator('#header .mobile-lang-options');
      await expect(languages.locator('a')).toHaveCount(4);
      await expect(languages.locator(`[hreflang="${locale}"]`)).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('#header .btn-mobile-call')).toHaveCount(0);
      await expect(page.locator('#mobile-menu-overlay .mobile-lang-options')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      const logo = await page.locator('#header .logo').boundingBox();
      const controls = await page.locator('#header .mobile-actions').boundingBox();
      expect(controls.x).toBeGreaterThan(logo.x + logo.width);
      expect(controls.x + controls.width).toBeLessThanOrEqual(viewport.width);

      await page.locator('#mobile-menu-toggle').click();
      const menu = page.locator('#mobile-menu-overlay');
      const services = menu.locator('.mobile-nav-group');
      const toggle = services.locator('summary');
      await expect(services).not.toHaveAttribute('open');
      await expect(services.locator('.mobile-nav-sub').first()).toBeHidden();
      expect(await toggle.evaluate(e => getComputedStyle(e).fontSize)).toBe(
        await menu.locator('.mobile-nav > .mobile-nav-link').first().evaluate(e => getComputedStyle(e).fontSize)
      );
      if (viewport.height === 844) {
        expect(await menu.evaluate(e => e.scrollHeight)).toBeLessThanOrEqual(viewport.height);
      }

      await toggle.click();
      await expect(services).toHaveAttribute('open', '');
      await expect(services.locator('.mobile-nav-sub')).toHaveCount(3);
      await expect(services.locator('.mobile-nav-sub').last()).toBeVisible();
      await expect(menu).toHaveClass(/active/);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(services).not.toHaveAttribute('open');
      await page.keyboard.press('Space');
      await expect(services).toHaveAttribute('open', '');

      const enquiry = menu.locator('.mobile-channel[data-contact-modal]');
      await enquiry.scrollIntoViewIfNeeded();
      await expect(enquiry).toBeInViewport();
      await toggle.scrollIntoViewIfNeeded();
      await services.locator('a[href$="naprawa-wifi/"]').click();
      await expect(page).toHaveURL(new RegExp(`${prefix}naprawa-wifi/$`));
      await expect(page.locator('#mobile-menu-toggle')).toHaveAttribute('aria-expanded', 'false');

      const target = locale === 'en' ? 'pl' : 'en';
      await page.locator(`#header .mobile-lang-btn[hreflang="${target}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${target === 'pl' ? '/' : '/en/'}naprawa-wifi/$`));
      await expect(page.locator('#header .mobile-lang-btn.active')).toHaveAttribute('hreflang', target);
    });
  }
}
