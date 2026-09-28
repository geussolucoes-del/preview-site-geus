async page => {
  const errors=[];let sends=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/locale',r=>r.fulfill({status:200,contentType:'application/json',body:'{"language":"pt"}'}));
  await page.route('https://api.emailjs.com/**',r=>{sends++;return r.fulfill({status:200,body:'OK'});});
  const amounts={autoflux:'R$ 2.000',cadia:'R$ 1.500',madg:'US$ 350'};
  for(const width of [320,390,1366])for(const product of Object.keys(amounts)){
    await page.setViewportSize({width,height:844});
    await page.goto('http://127.0.0.1:4173/diagnostico/?produto='+product);
    const gate=page.locator('[name="investment_ready"]');
    if(!(await page.locator('label[for="diagnostic-0-investment_ready"]').textContent()).includes(amounts[product]))throw Error('Wrong amount');
    await gate.selectOption('no');
    await page.locator('dialog[open]').waitFor();
    if(!(await page.locator('dialog p').textContent()).includes(amounts[product]))throw Error('Wrong confirmation amount');
    const bounds=await page.locator('dialog').boundingBox();
    if(bounds.x<0||bounds.x+bounds.width>width+1||bounds.y<0||bounds.y+bounds.height>845)throw Error('Dialog outside viewport');
    await page.getByRole('button',{name:'Quero corrigir minha resposta'}).click();
    if(await gate.inputValue()!=='')throw Error('Cancel did not reset');
    await gate.selectOption('no');await page.keyboard.press('Escape');
    if(await gate.inputValue()!=='')throw Error('Escape did not reset');
    await gate.selectOption('yes');
    for(const [name,value] of Object.entries({name:'Teste',company:'Empresa',phone:'33999999999',location:'Brasil'}))await page.locator('[name="'+name+'"]').fill(value);
    await page.locator('.form-actions button[type="submit"]').click();
    if(await page.locator('form').getAttribute('data-step')!=='1')throw Error('Yes did not advance');
    await page.getByRole('button',{name:'Voltar',exact:true}).click();
    await gate.selectOption('no');
    const eventPromise=page.evaluate(()=>new Promise(resolve=>{
      const original=window.dataLayer.push.bind(window.dataLayer);
      window.dataLayer.push=function(event){original(event);if(event.event==='diagnostic_form_disqualified')resolve(event);};
    }));
    await page.getByRole('button',{name:'Sim, confirmar',exact:true}).click();
    const event=await eventPromise;
    if(event.product!==product||event.reason!=='minimum_investment')throw Error('Wrong disqualification event');
    await page.waitForURL('**/agradecimento/**');
    if(!(await page.locator('[data-investment-exit]').textContent()).includes(amounts[product]))throw Error('Wrong exit message');
    if(!await page.getByRole('link',{name:'Seguir a Geus no Instagram ↗'}).isVisible())throw Error('No Instagram');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Exit overflow');
    if(await page.evaluate(()=>sessionStorage.getItem('geus_diagnostic_receipt')))throw Error('False receipt');
  }
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[name="product"]').selectOption('autoflux');
  await page.locator('[name="investment_ready"]').selectOption('yes');
  await page.locator('[name="product"]').selectOption('madg');
  if(await page.locator('[name="investment_ready"]').inputValue()!=='')throw Error('Product change kept approval');
  if(!(await page.locator('label[for="diagnostic-0-investment_ready"]').textContent()).includes('US$ 350'))throw Error('Home amount did not adapt');
  await page.locator('[name="product"]').selectOption('geral');
  if(await page.locator('[name="investment_ready"]').count())throw Error('General project got false threshold');
  if(sends!==0)throw Error('Disqualified visitor sent an email');
  if(errors.length)throw Error(errors.join(';'));
  return {passed:'3 products at 320,390,1366px; cancel; Escape; yes; confirmed no; Instagram; product change; dataLayer',realEmailsSent:0};
}
