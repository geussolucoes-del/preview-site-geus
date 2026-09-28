async (page) => {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/locale',route=>route.fulfill({status:200,contentType:'application/json',body:'{"language":"pt"}'}));
  await page.route('**/assets/lead-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.GEUS_EMAILJS={publicKey:"",serviceId:"",templateId:""};'}));
  const fill = async(product,width=1366,home=false) => {
    await page.setViewportSize({width,height:844});
    await page.goto('http://127.0.0.1:4173/'+(home?'':'diagnostico/')+'?produto='+product+(product==='autoflux'?'&plano=pro':''));
    await page.locator('[data-lang="pt"]').click();
    if(home)await page.locator('select[name="product"]').selectOption(product);
    else {
      if(await page.locator('select[name="product"]').count())throw Error('Diagnóstico de produto permite troca');
      if(await page.locator('input[name="product"]').inputValue()!==product)throw Error('Contexto do produto incorreto');
    }
    await page.locator('[name="investment_ready"]').selectOption('yes');
    for(const [name,value] of Object.entries({name:'Teste integração',company:'Empresa teste',phone:'33999999999',location:'Brasil'})) await page.locator('[name="'+name+'"]').fill(value);
    await page.locator('.form-actions button[type="submit"]').click();
    const values={autoflux:{stock:'11-30',sales:'6-15',vehicles:'Seminovos',territory:'Região local'},madg:{service:'Limpeza',territory:'Região local',capacity:'10',channel:'Instagram'},cadia:{channel:'whatsapp',volume:'11-50',process:'Equipe comercial',mode:'assistida'}}[product];
    for(const [name,value] of Object.entries(values)){
      const control=page.locator('[name="'+name+'"]');
      if(await control.evaluate(el=>el.tagName)==='SELECT')await control.selectOption(value);else await control.fill(value);
    }
    await page.locator('.form-actions button[type="submit"]').click();
    await page.locator('[name="goal"]').fill('Organizar captação e atendimento');
    await page.locator('[name="timing"]').selectOption('now');
    await page.locator('.diagnostic-consent input').check();
    await page.locator('.form-actions button[type="submit"]').click();
    if(await page.locator('.diagnostic-review a[href*="wa.me"]').count())throw Error('WhatsApp antes de enviar');
  };
  await fill('cadia',390);
  await page.getByRole('button',{name:'Enviar diagnóstico →'}).click();
  await page.getByText('Não conseguimos confirmar o envio.',{exact:false}).waitFor();
  if(page.url().includes('obrigado'))throw Error('Falso sucesso sem configuração');
  if(await page.locator('[name="name"]').inputValue()!=='Teste integração')throw Error('Perdeu dados');
  if(await page.evaluate(()=>window.dataLayer.some(x=>x.event==='diagnostic_form_submit')))throw Error('Conversão falsa');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow mobile');
  await page.getByRole('button',{name:'Editar respostas'}).click();
  if(await page.locator('select[name="product"]').count() || await page.locator('input[name="product"]').inputValue()!=='cadia')throw Error('Editar liberou troca de produto');
  await page.unroute('**/assets/lead-config.js*');
  await page.route('**/assets/lead-config.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.GEUS_EMAILJS={publicKey:"test",serviceId:"service_test",templateId:"template_unico"};'}));
  let failure=true;
  const requests=[];
  await page.route('https://api.emailjs.com/**',async route=>{
    requests.push(route.request().postDataJSON());
    await route.fulfill({status:failure?500:200,body:failure?'Erro simulado':'OK'});
  });
  await fill('autoflux');
  await page.getByRole('button',{name:'Enviar diagnóstico →'}).click();
  await page.getByText('Não conseguimos confirmar o envio.',{exact:false}).waitFor();
  if(page.url().includes('obrigado'))throw Error('Falso sucesso HTTP 500');
  failure=false;
  await page.getByRole('button',{name:'Enviar diagnóstico →'}).click();
  await page.waitForURL('**/obrigado/**');
  if(!await page.locator('[data-thank-whatsapp]').isVisible())throw Error('Sem CTA de obrigado');
  if(!decodeURIComponent(await page.locator('[data-thank-whatsapp]').getAttribute('href')).includes('Plano / Plan: PRO'))throw Error('Plano perdido');
  for(const product of ['madg','cadia']){
    await fill(product,product==='cadia'?390:1366,product==='madg');
    await page.getByRole('button',{name:'Enviar diagnóstico →'}).click();
    await page.waitForURL('**/obrigado/**');
    const receipt=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('geus_diagnostic_receipt')));
    if(receipt.product!==product)throw Error('Produto perdido');
  }
  const sentProducts=requests.map(r=>r.template_params.product_id);
  if(sentProducts.join(',')!=='autoflux,autoflux,madg,cadia')throw Error('Envios duplicados ou produtos errados');
  if(requests.some(r=>r.template_id!=='template_unico'))throw Error('Mais de um template');
  if(requests.some(r=>!r.template_params.answer_rows.some(row=>row.question.includes('disponíveis para começar')&&row.answer==='Sim, tenho esse investimento disponível')))throw Error('Confirmação de investimento ausente no email');
  if(!requests.at(-1).template_params.answers.includes('Quem atende hoje'))throw Error('Respostas CADIA ausentes');
  await page.evaluate(()=>sessionStorage.removeItem('geus_diagnostic_receipt'));
  await page.goto('http://127.0.0.1:4173/obrigado/');
  if(await page.locator('[data-thank-whatsapp]').isVisible())throw Error('Obrigado direto confirmou envio');
  await page.goto('http://127.0.0.1:4173/diagnostico/');
  await page.waitForURL('http://127.0.0.1:4173/#diagnostico');
  await page.locator('select[name="product"]').selectOption('autoflux');
  await page.locator('select[name="product"]').selectOption('cadia');
  if(await page.locator('[name="stock"]').count())throw Error('Homepage manteve perguntas do produto anterior');
  if(!await page.locator('[name="volume"]').count())throw Error('Homepage não adaptou perguntas');
  if(errors.length)throw Error(errors.join('; '));
  return {passed:['sem configuração','falha HTTP mantém respostas','AutoFlux com plano','MADG pela home','CADIA mobile','um template para todos','obrigado só com recibo'],realEmailsSent:0};
}
