import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const pages = ['index.html','produtos/index.html','produtos/autoflux/index.html','produtos/madg/index.html','produtos/cadia/index.html','portfolio/index.html','reviews/index.html','contato/index.html','diagnostico/index.html','obrigado/index.html','agradecimento/index.html','politica-de-privacidade/index.html','politica-de-cookies/index.html','termos-de-uso/index.html'];
test('Every public page has search metadata; WhatsApp is restricted to thank-you', () => {
  for (const path of pages) {
    const html = read(path);
    assert.match(html, /name="viewport"/);
    assert.match(html, /rel="canonical"/);
    if(!html.includes('content="noindex,follow"')) assert.match(html, /name="description"/);
    if(path !== 'obrigado/index.html') assert.doesNotMatch(html, /href="https:\/\/(?:wa\.me|api\.whatsapp\.com)/);
  }
});
test('Sitemap excludes transactional and unfinished pages and includes legal pages', () => {
  const sitemap = read('sitemap.xml');
  for(const path of ['diagnostico','obrigado','agradecimento','reviews']) {
    assert.doesNotMatch(sitemap, new RegExp('/'+path+'/'));
    assert.match(read(path+'/index.html'), /name="robots" content="noindex,\s*follow"/);
  }
  for(const path of ['politica-de-privacidade','politica-de-cookies','termos-de-uso']) assert.ok(sitemap.includes('/'+path+'/'));
});
test('Prices retain monthly fees and distinguish entry budget and implementation', () => {
  const auto = read('produtos/autoflux/index.html');
  for(const pair of [['997','199.40'],['1.797','359.40'],['3.497','699.40']]) assert.ok(auto.includes(`data-pt="${pair[0]}" data-en="${pair[1]}"`));
  assert.match(auto, /mensalidades dos planos/);
  assert.match(auto, /R\$ 2\.000 disponíveis/);
  assert.match(auto, /US\$ 400 available/);
  assert.match(read('produtos/madg/index.html'), /não representa um pacote mensal fechado/);
  const cadia = read('produtos/cadia/index.html');
  assert.match(cadia, /data-pt="R\$ 1\.500" data-en="US\$ 300"/);
  assert.match(cadia, /Operação recorrente contratada à parte/);
});
test('Legal notices identify actual providers, functional storage and human review', () => {
  const privacy = read('politica-de-privacidade/index.html');
  for(const provider of ['EmailJS','Vercel','Gmail']) assert.ok(privacy.includes(provider));
  const cookies = read('politica-de-cookies/index.html');
  for(const key of ['geus_language','geus_auto_language','geus_diagnostic_receipt']) assert.ok(cookies.includes(key));
  assert.match(read('agradecimento/index.html'), /mailto:geussolucoes@gmail.com/);
  assert.match(read('assets/ecosystem.js'), /cookies/);
});
test('Portfolio destination and Vercel privacy aliases are valid', () => {
  assert.match(read('portfolio/index.html'), /href="https:\/\/consolidados\.com\.ar\//);
  assert.doesNotMatch(read('portfolio/index.html'), /href="https:\/\/www\.consolidados\.com\.ar/);
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.redirects.find(r=>r.source==='/privacidade').destination, '/politica-de-privacidade/');
  assert.ok(config.headers[0].headers.some(h=>h.key==='X-Content-Type-Options'&&h.value==='nosniff'));
});
