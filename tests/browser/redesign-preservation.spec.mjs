import { test, expect } from '@playwright/test';

for (const route of ['/', '/naprawa-wifi/']) {
  test(`review stars keep private feedback and Google routing ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('preferredLanguage','pl');
      localStorage.setItem('naserwis_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,support:false}));
      window.__reviewTargets=[];
      window.open=url=>{window.__reviewTargets.push(String(url));return null;};
    });
    await page.route('**/api/contact',route=>route.abort());
    await page.goto(route);
    for(const rating of [1,2,3]) {
      await page.locator(`.star-btn[data-rating="${rating}"]`).click();
      await expect(page.locator('#review-modal')).toBeVisible();
      await expect(page.locator('#modal-rating')).toHaveValue(String(rating));
      await expect.poll(()=>page.evaluate(()=>window.__reviewTargets.length)).toBe(0);
      await page.keyboard.press('Escape');
      await expect(page.locator('#review-modal')).toBeHidden();
    }
    for(const rating of [4,5]) await page.locator(`.star-btn[data-rating="${rating}"]`).click();
    expect(await page.evaluate(()=>window.__reviewTargets)).toEqual([
      'https://g.page/r/CQRLc1zoW4ZaEBM/review',
      'https://g.page/r/CQRLc1zoW4ZaEBM/review'
    ]);
    await expect(page.locator('#review-modal')).toBeHidden();
  });
}

for(const reducedMotion of ['no-preference','reduce']) {
  test(`why-us copy stays readable in service details / ${reducedMotion}`,async({page})=>{
    await page.emulateMedia({reducedMotion});
    await page.addInitScript(()=>{
      localStorage.setItem('preferredLanguage','pl');
      localStorage.setItem('naserwis_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,support:false}));
    });
    await page.goto('/');
    await expect(page.locator('.why-us')).toBeHidden();
    await page.locator('.home-services-details > summary').click();
    await page.locator('.why-us').scrollIntoViewIfNeeded();
    await expect(page.locator('.why-us .section-title')).toHaveCSS('color','rgb(24, 33, 44)');
    for(const benefit of await page.locator('.why-us .benefit').all()) {
      await benefit.scrollIntoViewIfNeeded();
      await expect(benefit).toHaveCSS('opacity','1');
      await expect(benefit.locator('p')).toHaveCSS('color','rgb(72, 84, 98)');
    }
  });
}
