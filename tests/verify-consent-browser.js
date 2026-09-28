async page => {
 const base='http://127.0.0.1:4173';const errors=[];let gtm=0;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/locale',r=>r.fulfill({status:200,contentType:'application/json',body:'{"language":"pt"}'}));
 await page.route('**/assets/tag-config.js*',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.GEUS_TAGS={gtmId:"GTM-TEST123"};'}));
 await page.route('https://www.googletagmanager.com/**',r=>{gtm++;return r.fulfill({status:200,contentType:'application/javascript',body:'/* GTM mock: no tags */'});});
 const clear=async()=>{await page.goto(base);await page.evaluate(()=>{localStorage.removeItem('geus_cookie_consent');localStorage.setItem('geus_language','pt');});await page.reload();};
 const bounds=async selector=>{const okay=await page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1;});if(!okay)throw Error('Outside viewport: '+selector);};
 for(const width of [320,390,768,1366]) {
  await page.setViewportSize({width,height:844});await clear();
  await bounds('.geus-cookie-banner');
  if(gtm)throw Error('GTM before consent');
  await page.locator('.geus-cookie-banner [data-consent-open]').click();await bounds('.geus-cookie-dialog');
  if(await page.locator('[name="consent-analytics"]').isChecked()||await page.locator('[name="consent-marketing"]').isChecked())throw Error('Preselected optional consent');
  await page.keyboard.press('Escape');
  if(await page.locator('.geus-cookie-dialog').isVisible())throw Error('Escape failed');
  await page.locator('.geus-cookie-banner [data-consent-reject]').click();
  await page.reload();
  if(await page.locator('.geus-cookie-banner').isVisible()||gtm)throw Error('Rejection not retained');
 }
 await page.locator('.geus-cookie-footer button').click();
 await page.locator('[name="consent-analytics"]').check();
 await page.locator('[data-consent-save]').click();
 await page.waitForFunction(()=>document.querySelector('script[src*="googletagmanager.com/gtm.js"]'));
 if(!await page.evaluate(()=>window.GeusConsent.canUse('analytics')&&!window.GeusConsent.canUse('marketing')))throw Error('Category separation failed');
 await page.locator('.geus-cookie-footer button').click();
 await page.locator('.geus-cookie-dialog [data-consent-reject]').click();
 await page.waitForLoadState('load');
 if(await page.evaluate(()=>window.GeusConsent.canUse('analytics')))throw Error('Revocation failed');
 if(await page.locator('script[src*="googletagmanager.com/gtm.js"]').count())throw Error('GTM loaded after revocation');
 await page.evaluate(()=>localStorage.setItem('geus_cookie_consent',JSON.stringify({version:1,timestamp:0,analytics:true,marketing:true})));
 await page.reload();
 if(!await page.locator('.geus-cookie-banner').isVisible())throw Error('Expired consent did not prompt');
 await page.locator('.geus-cookie-banner [data-consent-accept]').click();
 await page.waitForFunction(()=>window.GeusConsent.canUse('marketing')&&window.GeusConsent.canUse('analytics'));
 await page.locator('.geus-cookie-footer button').click();
 await page.locator('.geus-cookie-dialog [data-consent-reject]').click();await page.waitForLoadState('load');
 for(const path of ['/politica-de-privacidade/','/politica-de-cookies/','/termos-de-uso/','/404.html']){
  await page.goto(base+path);if(await page.locator('.geus-cookie-footer button').count()!==1)throw Error('Preferences missing '+path);
 }
 await page.setViewportSize({width:390,height:844});await clear();
 await page.screenshot({path:'.playwright-cli/consent-mobile.png'});
 await page.locator('.geus-cookie-banner [data-consent-open]').click();
 await page.screenshot({path:'.playwright-cli/consent-settings-mobile.png'});
 await page.keyboard.press('Escape');await page.locator('.geus-cookie-banner [data-consent-reject]').click();
 await page.goto(base+'/404.html');
 await page.screenshot({path:'.playwright-cli/404-mobile.png'});
 await page.locator('[data-lang="en"]').click();
 await page.locator('.geus-cookie-footer button').click();
 if(!await page.getByRole('heading',{name:'Cookie preferences',exact:true}).isVisible())throw Error('English missing');
 if(errors.length)throw Error(errors.join(';'));
 return {passed:'banner 4 widths; reject; accept; category; expiry; revocation; Escape; legal footers; EN; 404',gtmRequests:'mocked only',realThirdPartyTags:0};
}
