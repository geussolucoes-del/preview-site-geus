import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const current=read('index.html').toString('utf8');
const original=execFileSync('git',['show','HEAD:index.html'],{cwd:root}).toString('utf8');
const normalize=html=>html.replaceAll('\r\n','\n').replace('ecosystem.css?v=17','ecosystem.css?v=16').replace(/        <div class="institutional-stage[\s\S]*?        <\/div>\n(?=      <\/div>)/,'        <!-- visual hero -->\n');
test('Only hero visual and its stylesheet version change in homepage HTML',()=>{
 assert.equal(normalize(current),normalize(original));
});
test('Original logo is byte-for-byte unchanged',()=>{
 const hash=data=>createHash('sha256').update(data).digest('hex');
 const originalLogo=execFileSync('git',['show','HEAD:assets/logo-geus-symbol.png'],{cwd:root,maxBuffer:1024*1024});
 assert.equal(hash(read('assets/logo-geus-symbol.png')),hash(originalLogo));
});
test('Picture has correct breakpoint, dimensions and accessible description',()=>{
 assert.match(current,/<source media="\(max-width: 680px\)"[^>]+width="1536" height="1024"/);
 assert.match(current,/class="institutional-hero-art"[^>]+width="1402" height="1122"[^>]+alt="[^"]+"/);
 assert.match(current,/institutional-hero-brand[^>]+aria-hidden="true"/);
});
test('Imported artwork retains original dimensions; scoped CSS contains without cropping',()=>{
 for(const [name,w,h] of [['desktop.png',1402,1122],['mobile.png',1536,1024]]){
  const png=read('images/hero-geus-preview/'+name);assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 const css=read('assets/ecosystem.css').toString('utf8');
 assert.match(css,/institutional-stage\.institutional-stage--art[^}]+min-height: 0/);
 assert.match(css,/institutional-stage--art \.institutional-hero-art[^}]+object-fit: contain/);
 assert.match(css,/max-width: 564px; justify-self: center/);
});
