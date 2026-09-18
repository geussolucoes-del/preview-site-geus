import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const cadia = read('produtos/cadia/index.html');
const diagnostic = read('diagnostico/index.html');
const js = read('assets/ecosystem.js');
const pages = ['index.html', 'produtos/index.html', 'produtos/cadia/index.html', 'diagnostico/index.html', 'produtos/autoflux/index.html', 'produtos/madg/index.html'];

test('CADIA has one H1, a canonical URL and valid structured data', () => {
  assert.equal((cadia.match(/<h1\b/g) || []).length, 1);
  assert.match(cadia, /rel="canonical" href="https:\/\/www.geussolucoes.com\/produtos\/cadia\/"/);
  const schema = JSON.parse(cadia.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'], 'Service');
  assert.equal(schema.name, 'CADIA');
  assert.equal(schema.provider.name, 'Geus Soluções');
});

for (const page of pages) {
  test(`${page}: unique IDs, complete translations and local targets`, () => {
    const html = read(page);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'Duplicate ID');
    for (const match of html.matchAll(/<[^>]+\sdata-pt="[^"]*"[^>]*>/g)) {
      assert.match(match[0], /\sdata-en="[^"]*"/, 'Missing English translation');
    }
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1].replaceAll('&amp;', '&');
      if (!target.startsWith('/') && !target.startsWith('#')) continue;
      const url = new URL(target, `https://www.geussolucoes.com/${page.replace(/index\.html$/, '')}`);
      const path = decodeURIComponent(url.pathname);
      const file = resolve(root, `.${path}${path.endsWith('/') ? 'index.html' : ''}`);
      assert.ok(existsSync(file), `Missing target: ${target}`);
      if (url.hash) {
        const destination = readFileSync(file, 'utf8');
        assert.ok(destination.includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${target}`);
      }
    }
  });
}

test('The three modes carry product and mode to the shared diagnostic', () => {
  for (const mode of ['assistida', 'supervisionada', 'autonoma']) {
    assert.ok(cadia.includes(`/diagnostico/?produto=cadia&amp;modo=${mode}`));
    assert.ok(read('assets/diagnostic.js').includes(mode));
  }
});

test('Catalog, home, both forms, footer and sitemap include CADIA', () => {
  for (const page of ['index.html', 'produtos/index.html']) {
    assert.equal((read(page).match(/class="product-panel(?: product-panel-cadia)?"/g) || []).length, 3);
    assert.match(read(page), /products-grid-three/);
    assert.match(read(page), /href="\/produtos\/cadia\/"/);
  }
  for (const page of ['index.html', 'diagnostico/index.html']) assert.match(read(page), /data-diagnostic-mount/);
  assert.match(js, /href="\/produtos\/cadia\/">CADIA/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/www.geussolucoes.com\/produtos\/cadia\/<\/loc>/);
});

test('The public offer distinguishes implementation, recurring service and scope', () => {
  assert.match(cadia, /Implantação a partir de/);
  assert.match(cadia, /R\$ 1\.500/);
  assert.match(cadia, /Operação recorrente contratada à parte/);
  assert.match(cadia, /sem acompanhamento humano diário/);
  assert.match(cadia, /curadoria periódica/);
  assert.doesNotMatch(cadia, /R\$ 1\.500\s*\/\s*mês|100%|vendas garantidas/);
});

test('Shared JS parses and preserves non-sending WhatsApp preparation', () => {
  assert.doesNotThrow(() => new Script(js));
  assert.match(js, /https:\/\/wa.me\/5533998347871\?text=/);
  assert.match(read("assets/diagnostic.js"), /encodeURIComponent\(message\(/);
  assert.doesNotMatch(read("assets/diagnostic.js"), /window.open|fetch\(/);
  assert.match(js, /prefers-reduced-motion: reduce/);
});

test('All CADIA actions retain context and use accent-free URLs', () => {
  const targets = [...cadia.matchAll(/href="(\/diagnostico\/[^"]*)"/g)].map(match => match[1]);
  assert.ok(targets.length >= 6);
  for (const target of targets) assert.ok(target.includes('produto=cadia'));
  assert.doesNotMatch(cadia, /\/diagnóstico\//);
  assert.match(cadia, /<details>/);
  assert.match(cadia, /<ol class="cadia-journey-grid">/);
  assert.match(read('assets/cadia.css'), /\.cadia-page \.reveal \{ opacity: 1; transform: none; \}/);
});
