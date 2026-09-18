/* Shared diagnostic: no lead is sent until the visitor sends the WhatsApp message. */
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
    return { product: Object.hasOwn(branches, q.get('produto')) ? q.get('produto') : '', plan: ['start','pro','premium'].includes(q.get('plano')) ? q.get('plano') : '', mode: ['assistida','supervisionada','autonoma'].includes(q.get('modo')) ? q.get('modo') : '' };
  }
  function entries(data, lang = 'pt') {
    const i = lang === 'en' ? 1 : 0;
    return fieldsFor(data.product).filter(field => String(data[field.name] || '').trim()).map(field => [field.label[i], field.options ? (field.options.find(option => option[0] === data[field.name]) || [,'',''])[i + 1] : String(data[field.name]).trim()]);
  }
  function message(data, lang, plan, source) {
    return [lang === 'en' ? 'Hello! I would like to discuss this business diagnostic with Geus.' : 'Olá! Quero conversar com a Geus sobre este diagnóstico da minha empresa.', ...entries(data, lang).map(([key, value]) => `${key}: ${value}`), ...(data.product === 'autoflux' && ['start','pro','premium'].includes(plan) ? [`Plano / Plan: ${plan.toUpperCase()}`] : []), `Origem / Source: ${source}`].join('\n');
  }
  function mount({ getLanguage, applyLanguage }) {
    const ctx = context(location.search);
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
      common.forEach(field => addField(field,steps[0]));
      const branchHost = el('div','diagnostic-branch'); steps[1].append(branchHost); budget.forEach(field=>addField(field,steps[1])); finalFields.forEach(field=>addField(field,steps[2]));
      const consent = el('label','diagnostic-consent'); const check = document.createElement('input'); check.type = 'checkbox'; check.required = true;
      const consentText = el('span','','Concordo que a Geus use estas informações para responder ao meu contato.','I agree that Geus may use this information to respond to my inquiry.');
      const privacy = el('a','','Política de privacidade','Privacy policy'); privacy.href = '/politica-de-privacidade/'; privacy.target = '_blank'; privacy.rel = 'noopener'; consent.append(check,consentText); steps[2].append(consent,privacy);
      const note = el('p','form-note','Ao concluir, você revisa as respostas e abre o WhatsApp. A mensagem só é enviada quando você tocar em Enviar no aplicativo.','After reviewing your answers, you open WhatsApp. The message is only sent when you tap Send in the app.'); form.append(note);
      const actions = el('div','form-actions'); const back = el('button','button','Voltar','Back'); back.type = 'button'; const next = el('button','button button-primary','Continuar','Continue'); next.type = 'submit'; actions.append(back,next); form.append(actions);
      const review = el('section','diagnostic-review'); review.hidden = true; review.tabIndex = -1; const title = el('h3','','Revise seu diagnóstico','Review your diagnostic'); const summary = el('dl'); const send = el('a','button button-primary','Abrir WhatsApp ↗','Open WhatsApp ↗'); send.target='_blank'; send.rel='noopener';
      const edit = el('button','button','Editar respostas','Edit answers'); edit.type='button'; review.append(title,summary,note.cloneNode(true),send,edit); form.append(review);
      let step = 0; let reviewing = false;
      function data() { return Object.fromEntries([...controls].filter(([,x])=>!x.control.disabled).map(([name,x])=>[name,x.control.value.trim()])); }
      function renderBranch() {
        for (const [name, item] of controls) if (branchHost.contains(item.control)) controls.delete(name);
        branchHost.replaceChildren(); (branches[controls.get('product').control.value] || branches.geral).forEach(field=>addField(field,branchHost));
        if (controls.has('mode') && ctx.mode) controls.get('mode').control.value = ctx.mode;
        applyLanguage(getLanguage());
      }
      function draw() { form.dataset.step = step; steps.forEach((s,i)=>{s.hidden=reviewing || i!==step;}); actions.hidden=reviewing; note.hidden=reviewing; review.hidden=!reviewing; back.hidden=step===0;
        progress.textContent=reviewing ? tr('Revisão — falta enviar no WhatsApp','Review — send in WhatsApp to finish') : tr(`Etapa ${step+1} de 3`,`Step ${step+1} of 3`);
        bilingual(next,step===2?'Revisar diagnóstico':'Continuar',step===2?'Review diagnostic':'Continue');
        if (reviewing) { summary.replaceChildren(); entries(data(),getLanguage()).forEach(([k,v])=>{const dt=el('dt');dt.textContent=k; const dd=el('dd');dd.textContent=v;summary.append(dt,dd);}); send.href=`https://wa.me/5533998347871?text=${encodeURIComponent(message(data(),getLanguage(),ctx.plan,location.pathname))}`; }
      }
      function focusStep() { const target = reviewing ? review : steps[step].querySelector('input,select,textarea'); target?.focus(); }
      form.addEventListener('submit', event=>{event.preventDefault();
        for(const {control,field} of controls.values()) { if(!steps[step].contains(control)) continue; control.setCustomValidity(validate(field,control.value)?'':tr(field.type==='tel'?'Informe um telefone válido com DDD/código do país.':'Preencha este campo com uma resposta válida.',field.type==='tel'?'Enter a valid phone with area/country code.':'Please enter a valid answer.')); if(!control.checkValidity()){control.setAttribute('aria-invalid','true');control.reportValidity();return;} }
        if(step===2 && !check.checked){check.reportValidity();return;}
        if(step<2) step++; else reviewing=true; draw();focusStep();
      });
      back.addEventListener('click',()=>{step=Math.max(0,step-1);draw();focusStep();}); edit.addEventListener('click',()=>{reviewing=false;step=0;draw();focusStep();});
      send.addEventListener('click',()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'diagnostic_whatsapp_open',product:data().product});});
      controls.get('product').control.addEventListener('change',renderBranch); controls.get('product').control.value=ctx.product; renderBranch(); document.addEventListener('geus:language',draw); draw();
    });
  }
  const api = { fieldsFor, validate, context, entries, message, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GeusDiagnostic = api;
})(typeof window === 'undefined' ? globalThis : window);
