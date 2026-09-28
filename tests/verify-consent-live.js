async page => {
 const base='https://www.geussolucoes.com';const requests=[],errors=[];
 page.on('request',r=>{if(/googletagmanager\.com|google-analytics\.com|connect\.facebook\.net/.test(r.url()))requests.push(r.url());});
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/');
 await page.locator('[data-lang="pt"]').click();
 if(!await page.locator('.geus-cookie-banner').isVisible())throw Error('Live banner missing');
 await page.locator('.geus-cookie-banner [data-consent-reject]').click();
 const response=await page.goto(base+'/geus-verificacao-404-setembro/');
 if(response.status()!==404)throw Error('Wrong status '+response.status());
 if(!await page.getByRole('heading',{name:'Esta página saiu do caminho.',exact:true}).isVisible())throw Error('Custom 404 missing');
 await page.locator('.geus-cookie-footer button').click();
 if(!await page.locator('.geus-cookie-dialog').isVisible())throw Error('Preferences missing on 404');
 await page.keyboard.press('Escape');
 await page.getByRole('link',{name:'Voltar ao início →',exact:true}).click();
 if(page.url()!==base+'/')throw Error('Recovery link failed');
 if(requests.length)throw Error('Unexpected tracking requests: '+requests.join(','));
 if(errors.length)throw Error(errors.join(';'));
 return {liveBanner:true,custom404:404,footerPreferences:true,homeRecovery:true,trackingRequests:0};
}
