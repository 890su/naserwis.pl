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
  test(`visible service choices and billing stay readable / ${reducedMotion}`,async({page})=>{
    await page.emulateMedia({reducedMotion});
    await page.addInitScript(()=>{
      localStorage.setItem('preferredLanguage','pl');
      localStorage.setItem('naserwis_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,support:false}));
    });
    await page.goto('/');
    await expect(page.locator('.why-us,.home-services-details')).toHaveCount(0);
    const headings = page.locator('.preview-task-heading h2');
    await expect(headings).toHaveCount(2);
    for(const heading of await headings.all()) {
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS('opacity','1');
      await expect(heading).toHaveCSS('color','rgb(24, 33, 44)');
    }
    const notes = page.locator('.home-pricing-notes p');
    await expect(notes).toHaveCount(4);
    for(const note of await notes.all()) {
      await note.scrollIntoViewIfNeeded();
      await expect(note).toBeVisible();
      await expect(note).toHaveCSS('opacity','1');
      const colour = await note.evaluate(el => el.classList.contains('billing-condition') ? 'rgb(24, 33, 44)' : 'rgb(72, 84, 98)');
      await expect(note).toHaveCSS('color',colour);
    }
  });
}
