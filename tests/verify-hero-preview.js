async page => {
 const base='http://127.0.0.1:4173';const results=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/locale',r=>r.fulfill({status:200,contentType:'application/json',body:'{"language":"pt"}'}));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base);
 await page.evaluate(()=>{localStorage.setItem('geus_language','pt');localStorage.setItem('geus_cookie_consent',JSON.stringify({version:1,timestamp:Date.now(),analytics:false,marketing:false}));});
 for(const width of [390,430,768,1024,1366]){
  await page.setViewportSize({width,height:900});await page.goto(base);
  await page.locator('[data-lang="pt"]').click();
  await page.locator('.institutional-hero-art').evaluate(i=>i.decode());
  await page.evaluate(()=>document.fonts.ready);
  const measured=await page.evaluate(()=>{
   const img=document.querySelector('.institutional-hero-art'), frame=img.closest('.institutional-stage');
   const imageRect=img.getBoundingClientRect(),rect=frame.getBoundingClientRect();
   const source=document.querySelector('.institutional-stage source');
   return {width:innerWidth,frame:{width:rect.width,height:rect.height},image:{width:imageRect.width,height:imageRect.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight},source:img.currentSrc.split('/').pop(),objectFit:getComputedStyle(img).objectFit,minHeight:getComputedStyle(frame).minHeight,overflow:document.documentElement.scrollWidth>innerWidth,alt:img.alt,mobileDimensions:[source.width,source.height]};
  });
  if(measured.overflow)throw Error('Horizontal overflow '+width);
  if(measured.source!==(width<=680?'mobile.png':'desktop.png'))throw Error('Wrong picture source '+width);
  const ratio=width<=680?1.5:1402/1122;
  if(Math.abs(measured.image.width/measured.image.height-ratio)>.005)throw Error('Image stretched '+width);
  if(measured.objectFit!=='contain'||measured.minHeight!=='0px')throw Error('Old crop/height retained '+width);
  if(width===768&&measured.frame.width>564.1)throw Error('Tablet too wide');
  await page.screenshot({path:'.playwright-cli/hero-preview-'+width+'-pt.png'});
  await page.locator('.institutional-hero').screenshot({path:'.playwright-cli/hero-preview-'+width+'-pt-hero.png'});
  await page.locator('[data-lang="en"]').click();
  if(!await page.locator('h1').textContent().then(t=>t.includes('Growth built from the inside out.')))throw Error('EN toggle failed');
  if(!await page.locator('.institutional-hero-art').getAttribute('aria-label').then(t=>t.includes('Portuguese')))throw Error('EN accessible description missing');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('EN overflow '+width);
  await page.screenshot({path:'.playwright-cli/hero-preview-'+width+'-en.png'});
  results.push(measured);
 }
 if(errors.length)throw Error(errors.join(';'));
 await page.locator('[data-lang="pt"]').click();
 await page.locator('.institutional-stage').screenshot({path:'.playwright-cli/hero-preview-brand-desktop.png',scale:'css'});
 return {results,errors,trackingConsent:'optional rejected for unobstructed review',artLabels:'Portuguese embedded in both images'};
}
