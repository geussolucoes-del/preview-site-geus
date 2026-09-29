async page => {
 const base='http://127.0.0.1:4173';const results=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/locale',r=>r.fulfill({status:200,contentType:'application/json',body:'{"language":"pt"}'}));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base);await page.evaluate(()=>{localStorage.setItem('geus_language','pt');localStorage.setItem('geus_cookie_consent',JSON.stringify({version:1,timestamp:Date.now(),analytics:false,marketing:false}));});
 for(const width of [390,430,768,1024,1366]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.locator('[data-lang="pt"]').click();
  await page.locator('.institutional-hero-art').evaluate(i=>i.decode());await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const img=document.querySelector('.institutional-hero-art'),frame=img.closest('.institutional-stage');
   const r=img.getBoundingClientRect(),copy=document.querySelector('.institutional-copy').getBoundingClientRect(),css=getComputedStyle(frame);
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let clear=0,partial=0,opaque=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)clear++;else if(data[i]===255)opaque++;else partial++;}
   const corners=[[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]].map(([x,y])=>ctx.getImageData(x,y,1,1).data[3]);
   return {viewport:innerWidth,source:img.currentSrc.split('/').pop(),width:r.width,height:r.height,left:r.left,right:r.right,gapToCopy:r.left-copy.right,belowCopy:r.top>=copy.bottom,border:css.borderTopWidth,background:css.backgroundColor,clipping:css.overflow,overflow:document.documentElement.scrollWidth>innerWidth,natural:[img.naturalWidth,img.naturalHeight],alpha:{clear,partial,opaque,corners}};
  });
  if(result.overflow||result.right>width+1||result.left<0)throw Error('Overflow '+width);
  if(result.border!=='0px'||result.background!=='rgba(0, 0, 0, 0)'||result.clipping!=='visible')throw Error('Card remnants '+width);
  const ratio=width<=680?1.5:1402/1122;if(Math.abs(result.width/result.height-ratio)>.001)throw Error('Stretched '+width);
  if(width>=981&&(Math.abs(result.right-width)>1||result.gapToCopy<0||result.gapToCopy>25))throw Error('Desktop alignment '+width);
  if(width<981&&!result.belowCopy)throw Error('Illustration overlaps text '+width);
  if(!result.alpha.clear)throw Error('Missing transparency');
  await page.screenshot({path:'.playwright-cli/hero-transparent-'+width+'-pt.png'});
  await page.locator('.institutional-hero').screenshot({path:'.playwright-cli/hero-transparent-'+width+'-hero.png'});
  await page.locator('[data-lang="en"]').click();
  if(!(await page.locator('h1').textContent()).includes('Growth built from the inside out.'))throw Error('EN failed');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('EN overflow '+width);
  await page.screenshot({path:'.playwright-cli/hero-transparent-'+width+'-en.png'});
  results.push(result);
 }
 await page.locator('[data-lang="pt"]').click();
 await page.locator('.institutional-stage').screenshot({path:'.playwright-cli/hero-transparent-brand.png'});
 if(errors.length)throw Error(errors.join(';'));
 return {results,errors,artwork:'Unmodified transparent PNGs; official symbol overlay'};
}
