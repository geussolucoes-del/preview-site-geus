(() => {
  'use strict';
  const KEY = 'geus_cookie_consent';
  const VERSION = 1;
  const TTL = 180 * 24 * 60 * 60 * 1000;
  const denied = { analytics: false, marketing: false };
  let choice = null, loaded = false, returnFocus = null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === VERSION && typeof saved.analytics === 'boolean' && typeof saved.marketing === 'boolean' && Number.isFinite(saved.timestamp) && saved.timestamp <= Date.now() && Date.now() - saved.timestamp < TTL) choice = saved;
  } catch {}
  window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
  const gtag = function () { window.dataLayer.push(arguments); };
  const state = preferences => ({
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
    functionality_storage: 'granted', security_storage: 'granted', personalization_storage: 'denied'
  });
  gtag('consent', 'default', state(denied));
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', false);
  if (choice) gtag('consent', 'update', state(choice));
  const loadTags = () => {
    const id = window.GEUS_TAGS?.gtmId;
    if (loaded || !choice || (!choice.analytics && !choice.marketing) || !/^GTM-[A-Z0-9]+$/.test(id || '')) return;
    loaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
    document.head.append(script);
  };
  loadTags();
  const copy = {
    pt: { title:'Sua privacidade, sua escolha.', text:'Usamos armazenamento necessário para idioma e funcionamento do site. Você pode autorizar análise e publicidade separadamente. As ferramentas opcionais estão sendo preparadas e só poderão funcionar com sua permissão.', accept:'Aceitar opcionais', reject:'Rejeitar opcionais', customize:'Personalizar', settings:'Preferências de cookies', save:'Salvar preferências', close:'Fechar', necessary:'Necessários — sempre ativos', required:'Idioma, segurança, recibo do diagnóstico e registro desta escolha. Não dependem da autorização de publicidade.', analytics:'Análise de navegação', analyticsText:'Permitir métricas de visitas e uso do site quando a ferramenta for instalada.', marketing:'Publicidade e campanhas', marketingText:'Permitir mensuração de campanhas, públicos e personalização quando as tags forem instaladas.', policy:'Política de cookies', privacy:'Privacidade', note:'Recusar não impede navegar ou enviar o diagnóstico. Você pode mudar sua escolha no rodapé a qualquer momento.' },
    en: { title:'Your privacy, your choice.', text:'We use necessary storage for language and site functionality. You may authorize analytics and advertising separately. Optional tools are being prepared and may only operate with your permission.', accept:'Accept optional', reject:'Reject optional', customize:'Customize', settings:'Cookie preferences', save:'Save preferences', close:'Close', necessary:'Necessary — always active', required:'Language, security, assessment receipt and a record of this choice. These do not depend on advertising permission.', analytics:'Navigation analytics', analyticsText:'Allow visit and site usage metrics when the tool is installed.', marketing:'Advertising and campaigns', marketingText:'Allow campaign measurement, audiences and personalization when the tags are installed.', policy:'Cookie policy', privacy:'Privacy', note:'Rejecting does not prevent browsing or submitting the assessment. You can change your choice in the footer at any time.' }
  };
  const lang = () => document.documentElement.lang.startsWith('en') ? 'en' : 'pt';
  let banner, dialog;
  const translate = () => {
    const texts = copy[lang()];
    document.querySelectorAll('[data-consent-text]').forEach(node => { node.textContent = texts[node.dataset.consentText]; });
  };
  const removeKnownCookies = preferences => {
    document.cookie.split(';').forEach(raw => {
      const name = raw.trim().split('=')[0];
      if ((!preferences.analytics && /^_ga(?:_|$)|^_gid$|^_gat/.test(name)) || (!preferences.marketing && /^_gcl|^_fbp$|^_fbc$/.test(name))) {
        const base = name + '=; Max-Age=0; Path=/; SameSite=Lax';
        document.cookie = base;
        const parts = location.hostname.split('.');
        for (let i=0; i<parts.length-1; i++) document.cookie = base + '; Domain=' + parts.slice(i).join('.');
      }
    });
  };
  const save = preferences => {
    const previous = choice || denied;
    choice = {version:VERSION, timestamp:Date.now(), analytics:!!preferences.analytics, marketing:!!preferences.marketing};
    try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch {}
    gtag('consent', 'update', state(choice));
    window.dataLayer.push({event:'cookie_consent_update', analytics_consent:choice.analytics, marketing_consent:choice.marketing});
    document.dispatchEvent(new CustomEvent('geus:consent', {detail:{analytics:choice.analytics, marketing:choice.marketing}}));
    removeKnownCookies(choice);
    banner.hidden = true;
    if (dialog.open) dialog.close();
    // Reload after reducing permission: a loaded third-party script cannot be unloaded safely.
    if (loaded && ((previous.analytics && !choice.analytics) || (previous.marketing && !choice.marketing))) location.reload();
    else loadTags();
  };
  const open = () => {
    if (!dialog) return;
    returnFocus = document.activeElement;
    dialog.querySelector('[name="consent-analytics"]').checked = !!choice?.analytics;
    dialog.querySelector('[name="consent-marketing"]').checked = !!choice?.marketing;
    translate();
    dialog.showModal();
  };
  window.GeusConsent = { open, get:() => ({...(choice || denied)}), canUse:category => !!choice?.[category] };
  const init = () => {
    banner = document.createElement('section');
    banner.className = 'geus-cookie-banner';
    banner.setAttribute('aria-labelledby','geus-cookie-title');
    banner.hidden = !!choice;
    banner.innerHTML = `<div><h2 id="geus-cookie-title" data-consent-text="title"></h2><p data-consent-text="text"></p><p class="geus-cookie-links"><a href="/politica-de-cookies/" data-consent-text="policy"></a> · <a href="/politica-de-privacidade/" data-consent-text="privacy"></a></p></div><div class="geus-cookie-actions"><button type="button" data-consent-reject data-consent-text="reject"></button><button type="button" data-consent-accept data-consent-text="accept"></button><button type="button" data-consent-open data-consent-text="customize"></button></div>`;
    dialog = document.createElement('dialog');
    dialog.className = 'geus-cookie-dialog';
    dialog.setAttribute('aria-labelledby','geus-cookie-settings-title');
    dialog.innerHTML = `<div class="geus-cookie-dialog-head"><h2 id="geus-cookie-settings-title" data-consent-text="settings"></h2><button type="button" data-consent-close data-consent-text="close"></button></div><p data-consent-text="note"></p><div class="geus-cookie-category"><strong data-consent-text="necessary"></strong><p data-consent-text="required"></p></div><label class="geus-cookie-category"><span><strong data-consent-text="analytics"></strong><span data-consent-text="analyticsText"></span></span><input type="checkbox" name="consent-analytics"></label><label class="geus-cookie-category"><span><strong data-consent-text="marketing"></strong><span data-consent-text="marketingText"></span></span><input type="checkbox" name="consent-marketing"></label><p><a href="/politica-de-cookies/" data-consent-text="policy"></a></p><div class="geus-cookie-actions"><button type="button" data-consent-reject data-consent-text="reject"></button><button type="button" data-consent-save data-consent-text="save"></button></div>`;
    document.body.append(banner,dialog);
    const footer = document.querySelector('footer');
    if (footer) {
      const row = document.createElement('div'); row.className='geus-cookie-footer';
      row.innerHTML='<button type="button" data-consent-open data-consent-text="settings"></button>';
      footer.append(row);
    }
    document.addEventListener('click', event => {
      if (event.target.closest('[data-consent-open]')) open();
      if (event.target.closest('[data-consent-close]')) dialog.close();
      if (event.target.closest('[data-consent-reject]')) save(denied);
      if (event.target.closest('[data-consent-accept]')) save({analytics:true,marketing:true});
      if (event.target.closest('[data-consent-save]')) save({analytics:dialog.querySelector('[name="consent-analytics"]').checked,marketing:dialog.querySelector('[name="consent-marketing"]').checked});
    });
    dialog.addEventListener('close', () => returnFocus?.focus());
    document.addEventListener('geus:language',translate);
    translate();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
