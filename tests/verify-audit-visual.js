async page => {
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('[data-menu]').click();
 if(await page.locator('[data-menu]').getAttribute('aria-expanded')!=='true')throw Error('Menu did not open');
 await page.keyboard.press('Escape');
 if(await page.locator('[data-menu]').getAttribute('aria-expanded')!=='false')throw Error('Menu did not close');
 if(!await page.locator('[data-menu]').evaluate(e=>e===document.activeElement))throw Error('Menu focus not restored');
 await page.goto('http://127.0.0.1:4173/produtos/autoflux/');
 await page.locator('[data-lang="en"]').click();
 await page.locator('.autoflux-plan').first().scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.autoflux-plan-grid')).opacity==='1');
 await page.screenshot({path:'.playwright-cli/audit-plans-mobile.png'});
 await page.setViewportSize({width:1366,height:900});
 await page.locator('.autoflux-plan').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:'.playwright-cli/audit-plans-desktop.png'});
 await page.setViewportSize({width:320,height:844});
 await page.goto('http://127.0.0.1:4173/politica-de-cookies/');
 await page.locator('table').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:'.playwright-cli/audit-cookies-mobile.png'});
 return {menu:'open, Escape, focus restoration passed',screenshots:3};
}
