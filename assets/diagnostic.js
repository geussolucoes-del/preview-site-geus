/* One diagnostic and one EmailJS template for every product. */
(function (root) {
  'use strict';
  const f = (name, pt, en, type = 'text', options = null, required = true) => ({ name, label: [pt, en], type, options, required });
  const options = (...rows) => rows.map(row => row.split('|'));
  const products = options('autoflux|AutoFlux — operação automotiva|AutoFlux — automotive', 'madg|MADG — serviços locais|MADG — local services', 'cadia|CADIA — atendimento com IA|CADIA — AI-assisted service', 'geral|Outro projeto / preciso de orientação|Other project / help me choose');
  const common = [
    f('product', 'O que sua empresa precisa?', 'What does your business need?', 'select', products),
    f('name', 'Seu nome', 'Your name'), f('company', 'Empresa', 'Business'),
    f('phone', 'WhatsApp com DDD ou código do país', 'WhatsApp with country / area code', 'tel'),
    f('email', 'E-mail (opcional)', 'Email (optional)', 'email', null, false),
    f('location', 'Cidade e país da empresa', 'Business city and country')
  ];
  const unknown = 'unknown|Não sabemos hoje|We do not know yet';
  const branches = {
    autoflux: [f('stock', 'Quantos veículos estão disponíveis?', 'How many vehicles are available?', 'select', options('1-10|Até 10|Up to 10', '11-30|11 a 30|11–30', '31-60|31 a 60|31–60', '61+|Mais de 60|More than 60', unknown)), f('sales', 'Vendas por mês, em média', 'Average monthly sales', 'select', options('0-5|Até 5|Up to 5', '6-15|6 a 15|6–15', '16-30|16 a 30|16–30', '31+|Mais de 30|More than 30', unknown)), f('vehicles', 'Quais veículos ou faixas de preço precisam de prioridade?', 'Which vehicles or price ranges need priority?'), f('territory', 'De quais cidades vêm os compradores? Onde quer vender?', 'Which cities do buyers come from? Where do you want to sell?')],
    madg: [f('service', 'Qual serviço você quer vender mais?', 'Which service do you want to sell more?'), f('territory', 'Quais cidades ou regiões consegue atender?', 'Which cities or areas can you serve?'), f('capacity', 'Quantos novos clientes consegue atender por mês?', 'How many new customers can you serve per month?'), f('channel', 'De onde vêm os clientes hoje?', 'Where do customers come from today?')],
    cadia: [f('channel', 'Onde chegam as conversas?', 'Where do conversations arrive?', 'select', options('whatsapp|WhatsApp|WhatsApp', 'instagram|Instagram|Instagram', 'site|Site|Website', 'multiple|Vários canais|Multiple channels')), f('volume', 'Novas conversas por dia, aproximadamente', 'Approximate new conversations per day', 'select', options('0-10|Até 10|Up to 10', '11-50|11 a 50|11–50', '51+|Mais de 50|More than 50', unknown)), f('process', 'Quem atende hoje e onde registra os contatos?', 'Who handles inquiries and where are contacts recorded?'), f('mode', 'Autonomia desejada (se já souber)', 'Preferred autonomy (if known)', 'select', options('assistida|Assistida|Assisted', 'supervisionada|Supervisionada|Supervised', 'autonoma|Autônoma|Autonomous', 'unknown|Quero orientação|Help me decide'), false)],
    geral: [f('operation', 'O que sua empresa faz e quem atende?', 'What does your business do and whom does it serve?'), f('project', 'O que você quer estruturar ou melhorar?', 'What do you want to build or improve?')]
  };
  const budget = [f('budget', 'Verba mensal disponível — informe valor e moeda, ou “a definir”', 'Available monthly budget — amount and currency, or “to be decided”')];
  const finalFields = [f('goal', 'Qual resultado importa mais e o que dificulta alcançá-lo?', 'Which result matters most and what is holding you back?', 'textarea'), f('timing', 'Quando pretende começar?', 'When would you like to start?', 'select', options('now|Assim que possível|As soon as possible', '30days|Nos próximos 30 dias|Within 30 days', 'planning|Estou planejando|I am planning')), f('website', 'Site ou Instagram (opcional)', 'Website or Instagram (optional)', 'text', null, false)];
  const fieldsFor = product => [...common, ...(branches[product] || branches.geral), ...budget, ...finalFields];
  function validate(field, value) {
    const v = String(value || '').trim();
    if (!v) return !field.required;
    if (v.length > (field.type === 'textarea' ? 600 : 180)) return false;
    if (field.options) return field.options.some(option => option[0] === v);
    if (field.type === 'tel') return /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, '').length >= 8 && v.replace(/\D/g, '').length <= 15;
    if (field.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return true;
  }
  function context(search) {
    const q = new URLSearchParams(search);
    const product = q.get('produto') === 'adg' ? 'madg' : q.get('produto');
    return { product: Object.hasOwn(branches, product) ? product : '', plan: ['start','pro','premium'].includes(q.get('plano')) ? q.get('plano') : '', mode: ['assistida','supervisionada','autonoma'].includes(q.get('modo')) ? q.get('modo') : '' };
  }
  function entries(data, lang = 'pt', exclude = []) {
    const i = lang === 'en' ? 1 : 0;
    return fieldsFor(data.product).filter(field => !exclude.includes(field.name) && String(data[field.name] || '').trim()).map(field => [field.label[i], field.options ? (field.options.find(option => option[0] === data[field.name]) || [,'',''])[i + 1] : String(data[field.name]).trim()]);
  }
  function message(data, lang, plan, source) {
    return [lang === 'en' ? 'Hello! I would like to discuss this business diagnostic with Geus.' : 'Olá! Quero conversar com a Geus sobre este diagnóstico da minha empresa.', ...entries(data, lang).map(([key, value]) => `${key}: ${value}`), ...(data.product === 'autoflux' && ['start','pro','premium'].includes(plan) ? [`Plano / Plan: ${plan.toUpperCase()}`] : []), `Origem / Source: ${source}`].join('\n');
  }
  function track(event, product, extra = {}) {
    root.dataLayer = Array.isArray(root.dataLayer) ? root.dataLayer : [];
    root.dataLayer.push({ event, product: product || 'geral', funnel: 'diagnostico_site', ...extra });
  }
  function mount({ getLanguage, applyLanguage }) {
    const ctx = context(location.search);
    const isHomepage = ['/', '/index.html'].includes(location.pathname);
    const fixedProduct = !isHomepage && ['autoflux','madg','cadia'].includes(ctx.product) ? ctx.product : '';
    if(!isHomepage && !fixedProduct){location.replace('/#diagnostico');return;}
    const contextNodes = [...document.querySelectorAll('[data-autoflux-pt], [data-cadia-pt]')].map(node => ({node, pt:node.dataset.pt, en:node.dataset.en}));
    document.querySelectorAll('[data-diagnostic-mount]').forEach((host, index) => {
      const form = document.createElement('form'); form.className = 'form-panel multi-step-form'; form.noValidate = true; form.dataset.diagnosticForm = '';
      host.replaceChildren(form);
      const tr = (pt, en) => getLanguage() === 'en' ? en : pt;
      const bilingual = (node, pt, en) => { node.dataset.pt = pt; node.dataset.en = en; node.textContent = tr(pt,en); return node; };
      const el = (tag, cls, pt, en) => { const n = document.createElement(tag); if (cls) n.className = cls; if (pt) bilingual(n,pt,en); return n; };
      const progress = el('p', 'form-note'); progress.setAttribute('aria-live','polite'); form.append(progress);
      const steps = []; const controls = new Map();
      function addField(field, container) {
        const wrap = el('div','field'); const label = el('label','',...field.label); const control = document.createElement(field.type === 'select' ? 'select' : field.type === 'textarea' ? 'textarea' : 'input');
        control.id = `diagnostic-${index}-${field.name}`; control.name = field.name; label.htmlFor = control.id;
        if (control.tagName === 'INPUT') control.type = field.type;
        control.required = field.required;
        if (field.type !== 'select') control.maxLength = field.type === 'textarea' ? 600 : 180;
        if (field.type === 'tel') control.autocomplete = 'tel';
        if (['name','email','company'].includes(field.name)) control.autocomplete = field.name === 'company' ? 'organization' : field.name;
        if (field.options) { const blank = el('option','','Selecione','Select'); blank.value = ''; control.append(blank); field.options.forEach(([value,pt,en]) => { const opt = el('option','',pt,en); opt.value = value; control.append(opt); }); }
        control.addEventListener('input', () => { control.setCustomValidity(''); control.removeAttribute('aria-invalid'); });
        wrap.append(label,control); container.append(wrap); controls.set(field.name, { control, field });
      }
      [['Sua empresa','Your business'],['Sua operação','Your operation'],['Seu próximo passo','Your next step']].forEach((titles) => { const s = el('fieldset','form-step'); s.append(el('legend','',...titles)); form.append(s); steps.push(s); });
      common.forEach(field => {
        if(field.name !== 'product' || !fixedProduct){addField(field,steps[0]);return;}
        const wrap=el('div','field diagnostic-product-context');
        wrap.append(el('p','form-note','Solução selecionada','Selected solution'));
        const names={autoflux:'AutoFlux',madg:'MADG',cadia:'CADIA'};
        const name=el('strong');name.textContent=names[fixedProduct];wrap.append(name);
        const control=document.createElement('input');control.type='hidden';control.name='product';control.value=fixedProduct;
        wrap.append(control);steps[0].append(wrap);controls.set('product',{control,field});
      });
      const branchHost = el('div','diagnostic-branch'); steps[1].append(branchHost); budget.forEach(field=>addField(field,steps[1])); finalFields.forEach(field=>addField(field,steps[2]));
      const consent = el('label','diagnostic-consent'); const check = document.createElement('input'); check.type = 'checkbox'; check.required = true;
      const consentText = el('span','','Concordo que a Geus use estas informações para responder ao meu contato.','I agree that Geus may use this information to respond to my inquiry.');
      const privacy = el('a','','Política de privacidade','Privacy policy'); privacy.href = '/politica-de-privacidade/'; privacy.target = '_blank'; privacy.rel = 'noopener'; consent.append(check,consentText); steps[2].append(consent,privacy);
      const note = el('p','form-note','Revise suas respostas e envie o diagnóstico. A equipe Geus recebe seu contexto para avaliar o próximo passo.','Review your answers and submit your diagnostic. The Geus team receives your context to assess the next step.'); form.append(note);
      const actions = el('div','form-actions'); const back = el('button','button','Voltar','Back'); back.type = 'button'; const next = el('button','button button-primary','Continuar','Continue'); next.type = 'submit'; actions.append(back,next); form.append(actions);
      const review = el('section','diagnostic-review'); review.hidden = true; review.tabIndex = -1; const title = el('h3','','Revise seu diagnóstico','Review your diagnostic'); const summary = el('dl'); const send = el('button','button button-primary','Enviar diagnóstico →','Submit diagnostic →'); send.type='button';
      const edit = el('button','button','Editar respostas','Edit answers'); edit.type='button'; review.append(title,summary,note.cloneNode(true),send,edit); form.append(review);
      const status = el('p','form-note diagnostic-status'); status.hidden=true; status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); review.append(status);
      let step = 0; let reviewing = false; let sending = false; let midpointTracked = false;
      function data() { return Object.fromEntries([...controls].filter(([,x])=>!x.control.disabled).map(([name,x])=>[name,name==='product' && fixedProduct ? fixedProduct : x.control.value.trim()])); }
      function renderBranch() {
        for (const [name, item] of controls) if (branchHost.contains(item.control)) controls.delete(name);
        const selectedProduct = fixedProduct || controls.get('product').control.value;
        contextNodes.forEach(({node,pt,en}) => {
          node.dataset.pt = node.getAttribute(`data-${selectedProduct}-pt`) || pt;
          node.dataset.en = node.getAttribute(`data-${selectedProduct}-en`) || en;
        });
        branchHost.replaceChildren(); (branches[selectedProduct] || branches.geral).forEach(field=>addField(field,branchHost));
        if (controls.has('mode') && ctx.mode) controls.get('mode').control.value = ctx.mode;
        applyLanguage(getLanguage());
      }
      function draw() { form.dataset.step = step; steps.forEach((s,i)=>{s.hidden=reviewing || i!==step;}); actions.hidden=reviewing; note.hidden=reviewing; review.hidden=!reviewing; back.hidden=step===0;
        progress.textContent=reviewing ? tr('Revisão — confirme e envie seu diagnóstico','Review — confirm and submit your diagnostic') : tr(`Etapa ${step+1} de 3`,`Step ${step+1} of 3`);
        bilingual(next,step===2?'Revisar diagnóstico':'Continuar',step===2?'Review diagnostic':'Continue');
        if (reviewing) { summary.replaceChildren(); entries(data(),getLanguage()).forEach(([k,v])=>{const dt=el('dt');dt.textContent=k; const dd=el('dd');dd.textContent=v;summary.append(dt,dd);}); if(data().product==='autoflux' && ctx.plan){const dt=el('dt');dt.textContent=tr('Plano de interesse','Plan of interest');const dd=el('dd');dd.textContent=ctx.plan.toUpperCase();summary.append(dt,dd);} }
      }
      function focusStep() { const target = reviewing ? review : steps[step].querySelector('input:not([type="hidden"]),select,textarea'); target?.focus(); }
      form.addEventListener('submit', event=>{event.preventDefault();
        if(sending || reviewing)return;
        for(const {control,field} of controls.values()) { if(!steps[step].contains(control)) continue; control.setCustomValidity(validate(field,control.value)?'':tr(field.type==='tel'?'Informe um telefone válido com DDD/código do país.':'Preencha este campo com uma resposta válida.',field.type==='tel'?'Enter a valid phone with area/country code.':'Please enter a valid answer.')); if(!control.checkValidity()){control.setAttribute('aria-invalid','true');control.reportValidity();return;} }
        if(step===2 && !check.checked){check.reportValidity();return;}
        if(step<2) step++; else reviewing=true;
        if(step===1 && !midpointTracked){midpointTracked=true;track('diagnostic_form_midpoint',data().product,{step:2});}
        draw();focusStep();
      });
      back.addEventListener('click',()=>{step=Math.max(0,step-1);draw();focusStep();}); edit.addEventListener('click',()=>{reviewing=false;step=0;draw();focusStep();});
      send.addEventListener('click',async()=>{
        if(sending)return;
        const values=data();
        // Revalidate the entire payload, not just the currently visible step.
        for(const {field,control} of controls.values()){
          if(!validate(field,control.value)){reviewing=false;step=steps.findIndex(s=>s.contains(control));draw();control.focus();control.reportValidity();return;}
        }
        if(!check.checked){reviewing=false;step=2;draw();check.reportValidity();return;}
        const answers=entries(values,getLanguage(),['product','name','company','phone','email']).map(([question,answer])=>({question,answer}));
        if(values.product==='autoflux' && ctx.plan)answers.push({question:tr('Plano de interesse','Plan of interest'),answer:ctx.plan.toUpperCase()});
        const payload={productId:values.product,labels:{name:values.name,company:values.company,phone:values.phone,email:values.email},answers,privacyConsent:check.checked,pageUrl:location.href,sourceCta:ctx.product ? `Diagnóstico ${ctx.product}` : 'Diagnóstico geral'};
        sending=true;send.disabled=true;edit.disabled=true;form.setAttribute('aria-busy','true');
        status.hidden=false;bilingual(status,'Estamos enviando seu diagnóstico…','Sending your diagnostic…');
        track('diagnostic_form_submit_attempt',values.product);
        try{
          await root.GEUSLeadService.send(payload);
          track('diagnostic_form_submit',values.product,{delivery:'emailjs_accepted'});
          const receipt={product:values.product,message:message(values,getLanguage(),ctx.plan,location.pathname)};
          try{sessionStorage.setItem('geus_diagnostic_receipt',JSON.stringify(receipt));}catch{}
          location.assign('/obrigado/?produto='+encodeURIComponent(values.product)+'&enviado=1');
        }catch(error){
          track('diagnostic_form_error',values.product,{error_code:error.code || 'network_error'});
          bilingual(status,'Não conseguimos confirmar o envio. Suas respostas continuam aqui. Tente novamente ou escreva para geussolucoes@gmail.com.','We could not confirm submission. Your answers are still here. Try again or email geussolucoes@gmail.com.');
        }finally{sending=false;send.disabled=false;edit.disabled=false;form.removeAttribute('aria-busy');}
      });
      if(!fixedProduct)controls.get('product').control.addEventListener('change',renderBranch);
      controls.get('product').control.value=fixedProduct;
      renderBranch(); document.addEventListener('geus:language',draw); draw();
    });
  }
  const api = { fieldsFor, validate, context, entries, message, mount, track };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GeusDiagnostic = api;
})(typeof window === 'undefined' ? globalThis : window);
