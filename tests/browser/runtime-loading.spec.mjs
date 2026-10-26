import { test, expect } from '@playwright/test';

for(const prefix of ['', 'ru/', 'uk/', 'en/']) {
  test(`review editor is deferred and preserves a cold first interaction /${prefix}`,async({page})=>{
    await page.setViewportSize({width:390,height:700});
    await page.addInitScript(()=>localStorage.setItem('naserwis_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,support:false})));
    let release,requests=0;
    const held=new Promise(resolve=>{release=resolve;});
    await page.route('**/assets/review-editor-*.js',async route=>{requests++;await held;await route.continue();});
    await page.goto('/'+prefix);
    expect(requests).toBe(0);
    const star=page.locator('.star-btn[data-rating="1"]');
    await star.click();
    await expect(page.locator('#review-modal')).toHaveClass(/active/);
    await expect.poll(()=>requests).toBe(1);
    await page.locator('#review-text').fill('QA: cancel while loading');
    await page.keyboard.press('Escape');
    await expect(page.locator('#review-modal')).not.toHaveClass(/active/);
    await expect(page.locator('#review-text')).toHaveValue('');
    release();
    await expect.poll(()=>page.evaluate(()=>[...document.scripts].some(script=>script.src.includes('/assets/review-editor-')))).toBe(true);
    await star.click();
    await page.locator('#review-text').fill('QA: do not submit');
    await expect(page.locator('.btn-post')).toBeEnabled();
    await page.locator('.btn-cancel').click();
    await expect(page.locator('#review-modal')).not.toHaveClass(/active/);
    expect(requests).toBe(1);
  });
}

test('business pages do not load review code; a failed editor request can retry',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('naserwis_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,support:false})));
  let requests=0;
  await page.route('**/assets/review-editor-*.js',route=>{requests++;return requests===1?route.abort():route.continue();});
  await page.goto('/dla-firm/monitoring/');
  await page.locator('footer').scrollIntoViewIfNeeded();
  expect(requests).toBe(0);
  await page.goto('/');
  await page.locator('.star-btn[data-rating="1"]').click();
  await page.keyboard.press('Escape');
  await page.locator('.star-btn[data-rating="1"]').click();
  await page.locator('#review-text').fill('QA: retry only, do not submit');
  await expect(page.locator('.btn-post')).toBeEnabled();
  expect(requests).toBeGreaterThanOrEqual(2);
});
