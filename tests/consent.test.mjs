import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
function boot(saved=null,id='GTM-TEST123',blocked=false) {
  const requests=[];
  const window={dataLayer:[],GEUS_TAGS:{gtmId:id}};
  const document={readyState:'loading',addEventListener(){},createElement(){return {};},head:{append(script){requests.push(script.src);}}};
  const localStorage={getItem(){if(blocked)throw Error('blocked');return saved;}};
  runInNewContext(read('assets/consent.js'),{window,document,localStorage,Date,CustomEvent:class{}});
  return {window,requests};
}
test('Consent defaults denied and no GTM request before a choice',()=>{
  const {window,requests}=boot();
  const defaults=window.dataLayer[0];
  assert.equal(defaults[0],'consent');assert.equal(defaults[1],'default');
  for(const key of ['analytics_storage','ad_storage','ad_user_data','ad_personalization'])assert.equal(defaults[2][key],'denied');
  assert.equal(requests.length,0);assert.equal(window.GeusConsent.canUse('analytics'),false);
});
test('Saved rejection, expired, forged and blocked storage fail closed',()=>{
  for(const saved of [null,'invalid',JSON.stringify({version:1,timestamp:Date.now(),analytics:false,marketing:false}),JSON.stringify({version:1,timestamp:0,analytics:true,marketing:true}),JSON.stringify({version:1,timestamp:Date.now(),analytics:'yes',marketing:true}),JSON.stringify({version:9,timestamp:Date.now(),analytics:true,marketing:true})]) assert.equal(boot(saved).requests.length,0);
  assert.equal(boot(null,'GTM-TEST123',true).requests.length,0);
});
test('Saved category grants only that category before loading a valid container',()=>{
  const saved=JSON.stringify({version:1,timestamp:Date.now(),analytics:true,marketing:false});
  const {window,requests}=boot(saved);
  assert.equal(window.dataLayer[3][2].analytics_storage,'granted');
  assert.equal(window.dataLayer[3][2].ad_storage,'denied');
  assert.equal(requests.length,1);assert.match(requests[0],/gtm.js\?id=GTM-TEST123/);
  assert.equal(boot(saved,'').requests.length,0);
  assert.equal(boot(saved,'bad<script>').requests.length,0);
});
test('Banner exists on all public pages and 404 uses root-relative assets',()=>{
  const paths=['index.html','produtos/index.html','produtos/autoflux/index.html','produtos/madg/index.html','produtos/cadia/index.html','portfolio/index.html','reviews/index.html','contato/index.html','diagnostico/index.html','obrigado/index.html','agradecimento/index.html','politica-de-privacidade/index.html','politica-de-cookies/index.html','termos-de-uso/index.html','404.html'];
  for(const path of paths){const html=read(path);assert.ok(html.indexOf('tag-config.js')<html.indexOf('consent.js'));assert.match(html,/src="\/assets\/consent.js/);assert.match(html,/href="\/assets\/consent.css/);}
  assert.match(read('404.html'),/content="noindex,follow"/);
  assert.doesNotMatch(read('sitemap.xml'),/404/);
  assert.match(read('politica-de-cookies/index.html'),/geus_cookie_consent/);
});
