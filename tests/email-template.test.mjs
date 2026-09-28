import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';

const {entries}=createRequire(import.meta.url)('../assets/diagnostic.js');
const source=readFileSync(new URL('../assets/lead-service.js',import.meta.url),'utf8');
const template=readFileSync(new URL('../emailjs/template-unico.html',import.meta.url),'utf8');
const sandbox={window:{},Date,URLSearchParams};
runInNewContext(source,sandbox);
const service=sandbox.window.GEUSLeadService;

for(const product of ['autoflux','madg','cadia']){
  test(`${product}: template variables match the real payload, including response rows`,()=>{
    const values={product,name:'Contato exemplo',company:'Empresa exemplo',phone:'+55 33 99999-0000',
      location:'Brasil',stock:'11-30',sales:'6-15',vehicles:'Seminovos',territory:'Região local',
      service:'Limpeza',capacity:'10 clientes',channel:'whatsapp',volume:'11-50',process:'Equipe comercial',
      mode:'assistida',budget:'A definir',goal:'Melhorar a operação',timing:'now'};
    const answers=entries(values,'pt',['product','name','company','phone','email']).map(([question,answer])=>({question,answer}));
    const params=service.buildTemplateParams({productId:product,labels:values,answers,
      privacyConsent:true,pageUrl:'https://www.geussolucoes.com/diagnostico/?produto='+product});
    assert.equal(params.product_id,product);
    assert.equal(params.email,'Não informado');
    assert.equal(params.qualified,'A avaliar');
    assert.ok(params.answer_rows.length>0);
    assert.ok(!params.answer_rows.some(row=>row.question==='Seu nome'));
    const variables=[...template.matchAll(/\{\{([a-z_]+)\}\}/g)].map(match=>match[1]);
    for(const variable of variables)assert.ok(Object.hasOwn(params,variable)||['question','answer'].includes(variable),`Missing variable ${variable}`);
    if(product==='cadia')assert.ok(params.answer_rows.some(row=>row.answer==='Assistida'));
    if(product==='madg')assert.ok(!params.answers.includes('veículos'));
  });
}

test('Email HTML uses escaped variables, a fallback and fluid table layout',()=>{
  assert.doesNotMatch(template,/\{\{\{|<script|<form|href="mailto:\{\{email\}\}"/i);
  assert.match(template,/\{\{#answer_rows\}\}/);
  assert.match(template,/\{\{\/answer_rows\}\}/);
  assert.match(template,/\{\{\^answer_rows\}\}/);
  assert.match(template,/max-width:600px/);
  assert.match(template,/\[if mso\]/);
  assert.match(template,/max-width:380px/);
});
