import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const {fieldsFor,validate,context,entries,message,track,minimums,investmentStatus}=createRequire(import.meta.url)('../assets/diagnostic.js');

test('Each product requires explicit minimum investment confirmation',()=>{
 assert.equal(minimums.autoflux.amount,'R$ 2.000');
 assert.equal(minimums.cadia.amount,'R$ 1.500');
 assert.equal(minimums.madg.amount,'US$ 350');
 for(const product of ['autoflux','madg','cadia']){
  assert.equal(investmentStatus({product}),'pending');
  assert.equal(investmentStatus({product,investment_ready:'no'}),'ineligible');
  assert.equal(investmentStatus({product,investment_ready:'yes'}),'eligible');
  const gate=fieldsFor(product).find(f=>f.name==='investment_ready');
  assert.ok(gate.required);assert.equal(validate(gate,'unknown'),false);
  assert.ok(gate.label[0].includes(minimums[product].amount));
  assert.ok(entries({product,investment_ready:'yes'}).some(([q,a])=>q.includes(minimums[product].amount)&&a.includes('Sim')));
 }
 assert.equal(investmentStatus({product:'geral'}),'not_applicable');
});

test('Funnel events distinguish all products without personal data',()=>{
 const previous=globalThis.dataLayer;
 globalThis.dataLayer=[];
 try {
  for(const product of ['autoflux','madg','cadia']){
   for(const event of ['diagnostic_form_open_click','diagnostic_form_midpoint','diagnostic_form_submit','diagnostic_thank_you_whatsapp_click']){
    track(event,product);
    assert.deepEqual(globalThis.dataLayer.at(-1),{event,product,funnel:'diagnostico_site'});
   }
  }
  assert.equal(globalThis.dataLayer.length,12);
 } finally {
  if(previous===undefined)delete globalThis.dataLayer;else globalThis.dataLayer=previous;
 }
});
test('Routes only accept known products, plans and modes',()=>{
 assert.deepEqual(context('?produto=autoflux&plano=premium'),{product:'autoflux',plan:'premium',mode:''});
 assert.deepEqual(context('?produto=__proto__&plano=free&modo=unknown'),{product:'',plan:'',mode:''});
});
test('Changing product cannot include answers from the previous product',()=>{
 const data={product:'madg',stock:'31-60',sales:'16-30',service:'Instalação',name:'Teste'};
 const result=message(data,'pt','pro','/diagnostico/');
 assert.match(result,/Instalação/);assert.doesNotMatch(result,/31–60|Plano|veículos/);
 assert.equal(new Set(fieldsFor('cadia').map(f=>f.name)).size,fieldsFor('cadia').length);
});
test('Validation rejects whitespace, invalid phones, email and forged choices',()=>{
 const f=Object.fromEntries(fieldsFor('autoflux').map(f=>[f.name,f]));
 assert.equal(validate(f.name,'   '),false);assert.equal(validate(f.phone,'123'),false);
 assert.equal(validate(f.phone,'+55 (69) 99999-0000'),true);assert.equal(validate(f.phone,'call12345678'),false);
 assert.equal(validate(f.email,''),true);assert.equal(validate(f.email,'a@b'),false);
 assert.equal(validate(f.stock,'invalid'),false);assert.equal(validate(f.goal,'a'.repeat(601)),false);
});
test('English summaries translate labels and choices and keep product context',()=>{
 const data={product:'cadia',mode:'assistida',volume:'unknown'};
 const result=entries(data,'en');assert.ok(result.some(([k,v])=>v==='Assisted'));
 assert.match(message(data,'en','','/diagnostico/'),/We do not know yet/);
});
