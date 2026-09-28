async page => {
 const base=await page.evaluate(()=>location.origin);
 const paths=['/','/produtos/','/produtos/autoflux/','/produtos/madg/','/produtos/cadia/','/portfolio/','/reviews/','/contato/','/diagnostico/?produto=autoflux','/obrigado/','/agradecimento/?produto=cadia&motivo=investimento','/politica-de-privacidade/','/politica-de-cookies/','/termos-de-uso/','/404.html'];
 const findings=[],links=new Set(),resources=new Set(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('request',r=>resources.add(r.url()));
 for(const path of paths){
  for(const width of [320,390,768,1366]){
   await page.setViewportSize({width,height:900});await page.goto(base+path);
   if(await page.locator('[data-lang="pt"]').count())await page.locator('[data-lang="pt"]').click();
   const result=await page.evaluate(()=>{
    const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    return {
     overflow:document.documentElement.scrollWidth>innerWidth,
     outside:[...document.querySelectorAll('main h1,main h2,main h3,main p,main a,main input,main select,main textarea,footer a')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1;}).map(e=>({tag:e.tagName,text:e.textContent.trim().slice(0,65),class:e.className})).slice(0,10),
     links:[...document.querySelectorAll('a[href]')].map(e=>e.href),
     title:document.title,canonical:document.querySelector('link[rel="canonical"]')?.href,description:document.querySelector('meta[name="description"]')?.content,
     brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)
    };
   });
   result.links.forEach(l=>links.add(l));
   if(result.overflow||result.outside.length||result.brokenImages.length)findings.push({path,width,...result,links:undefined});
   if(width===1366&&!result.canonical&&path!=='/404.html')findings.push({path,missingCanonical:true});
   if(await page.locator('[data-lang="en"]').count()){
    await page.locator('[data-lang="en"]').click();
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))findings.push({path,width,englishOverflow:true});
   }
  }
 }
 const brokenLinks=[];
 for(const link of links){
  const url=await page.evaluate(link=>{const u=new URL(link);return {origin:u.origin,protocol:u.protocol,href:u.href,hash:u.hash};},link);if(url.origin!==base)continue;
  if(!['http:','https:'].includes(url.protocol))continue;
  const response=await page.request.get(url.href);
  if(response.status()>=400){brokenLinks.push({url:link,status:response.status()});continue;}
  if(url.hash){const html=await response.text();const exists=await page.evaluate(({html,id})=>new DOMParser().parseFromString(html,'text/html').getElementById(id)!==null,{html,id:decodeURIComponent(url.hash.slice(1))});if(!exists)brokenLinks.push({url:link,missingAnchor:true});}
 }
 const thirdPartyOrigins=await page.evaluate(resources=>[...new Set(resources.map(l=>new URL(l).origin))], [...resources].filter(l=>l.startsWith('https:')&&!l.startsWith(base)));
 return {findings,brokenLinks,errors:[...new Set(errors)],externalLinks:[...links].filter(l=>l.startsWith('https:')&&!l.startsWith(base)),thirdPartyOrigins,cookies:await page.context().cookies(),pages:paths.length,viewports:4};
}
