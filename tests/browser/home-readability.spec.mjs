import {test,expect} from '@playwright/test';
for(const prefix of ['', 'ru/', 'uk/', 'en/']){
 test('existing service fragment stays usable /'+prefix,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/'+prefix+'#available-services');
  await expect(page.locator('#available-services')).toBeVisible();
  await expect(page.locator('.home-disclosure')).toHaveCount(0);
  const box=await page.locator('#available-services').boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(60);
 });
 for(const width of [320,390,768,1440,1920]){
  test('visible homepage essentials /'+prefix+' at '+width+'px',async({page})=>{
   await page.setViewportSize({width,height:900});
   await page.addInitScript(()=>localStorage.setItem('naserwis_consent_v1',JSON.stringify({version:1,analytics:false,marketing:false,support:false})));
   await page.route(/googletagmanager|google-analytics|chatwoot|ai\.czait\.pl/,route=>route.abort());
   await page.goto('/'+prefix);
   await expect(page.locator('main>section:not(.mobile-enquiry-slot)')).toHaveCount(6);
   await expect(page.locator('#hero-form')).toBeVisible();
   await expect(page.locator('#final-form')).toHaveCount(0);
   await expect(page.locator('.home-more,.home-disclosure,.home-service-catalog')).toHaveCount(0);
   const amounts={ '':'od','ru/':'от','uk/':'від','en/':'from' };
   const currency=prefix==='en/'?'PLN':'zł';
   await expect(page.locator('.home-pricing-rates .preview-rate strong')).toHaveText([200,250,150].map(n=>amounts[prefix]+' '+n+' '+currency));
   for(const selector of ['.billing-condition','.billing-rule','.billing-project','.price-disclaimer']){
    await expect(page.locator('.home-pricing-notes '+selector)).toBeVisible();
    expect(await page.locator('.home-pricing-notes '+selector).evaluate(e=>!!e.closest('details'))).toBe(false);
   }
   await expect(page.locator('.preview-task-link:not(.preview-business-link)')).toHaveCount(6);
   for(const route of ['naprawa-wifi/','naprawa-sieci/','montaz-sieci/','serwis-monitoringu/']){
    await expect(page.locator('.preview-task-pair a[href="/'+prefix+route+'"]').first()).toBeVisible();
   }
   await expect(page.locator('.preview-business-link')).toHaveAttribute('href','/'+prefix+'dla-firm/');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
   if(width>=1440){
    const grids=await page.locator('main>section:not(.mobile-enquiry-slot)>.container').evaluateAll(elements=>elements.map(e=>({x:e.getBoundingClientRect().x,w:e.getBoundingClientRect().width})));
    expect(new Set(grids.map(g=>Math.round(g.x))).size).toBe(1);
    expect(new Set(grids.map(g=>Math.round(g.w))).size).toBe(1);
   }
   const contact=page.locator('.home-contact-cta');
   await contact.scrollIntoViewIfNeeded();
   await expect(contact.locator('.btn')).toHaveCount(2);
   await expect(contact.locator('form,textarea')).toHaveCount(0);
   await contact.locator('[data-contact-modal]').click();
   await expect(page.locator('#quick-contact-modal')).toBeVisible();
   await expect(page.locator('#quick-message')).toBeVisible();
   await page.keyboard.press('Escape');
   await expect(page.locator('#quick-contact-modal')).toBeHidden();
  });
 }
}
