const LANG_KEY = "geus_language";
const AUTO_LANG_KEY = "geus_auto_language";
const isPortuguese = (navigator.language || "").toLowerCase().startsWith("pt");
const safeGet = (type, key) => { try { return window[type].getItem(key); } catch { return null; } };
const safeSet = (type, key, value) => { try { window[type].setItem(key, value); } catch {} };
const storedLanguage = safeGet("localStorage", LANG_KEY);
const autoLanguage = safeGet("sessionStorage", AUTO_LANG_KEY);
let language = storedLanguage || autoLanguage || (isPortuguese ? "pt" : "en");

const dictionary = {
  pt: {
    skip: "Ir para o conteúdo", navProducts: "Produtos", navPortfolio: "Portfólio", navReviews: "Reviews", navContact: "Contato", talk: "Falar agora",
    menuLabel: "Abrir menu", closeMenu: "Fechar menu", navLabel: "Principal", audit: "Diagnóstico", privacy: "Privacidade", terms: "Termos", footerLine: "Tecnologia e crescimento construídos de perto para negócios reais.", rights: "Geus Soluções. Todos os direitos reservados."
  },
  en: {
    skip: "Skip to content", navProducts: "Products", navPortfolio: "Portfolio", navReviews: "Reviews", navContact: "Contact", talk: "Talk to us",
    menuLabel: "Open menu", closeMenu: "Close menu", navLabel: "Main navigation", audit: "Assessment", privacy: "Privacy", terms: "Terms", footerLine: "Technology and growth built closely around real businesses.", rights: "Geus Solutions. All rights reserved."
  }
};

const currentPath = location.pathname.replace(/\/$/, "") || "/";
const activeProduct = ["autoflux", "madg", "cadia"].find(product => currentPath === `/produtos/${product}`);
const diagnosticHref = activeProduct ? `/diagnostico/?produto=${activeProduct}` : "/diagnostico/";
const navCurrent = (path) => currentPath === path || (path !== "/" && currentPath.startsWith(path));

const renderChrome = () => {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  if (header) header.innerHTML = `
    <a class="skip-link" href="#main" data-t="skip"></a>
    <div class="site-header"><div class="container header-inner">
      <a class="brand" href="/" aria-label="Geus"><img src="/assets/logo-geus-symbol.png" alt="" width="34" height="34"><span>geus</span></a>
      <nav class="desktop-nav" aria-label="Principal">
        <a href="/produtos/" ${navCurrent("/produtos") ? 'aria-current="page"' : ""} data-t="navProducts"></a>
        <a href="/portfolio/" ${navCurrent("/portfolio") ? 'aria-current="page"' : ""} data-t="navPortfolio"></a>
        <a href="/reviews/" ${navCurrent("/reviews") ? 'aria-current="page"' : ""} data-t="navReviews"></a>
        <a href="/contato/" ${navCurrent("/contato") ? 'aria-current="page"' : ""} data-t="navContact"></a>
      </nav>
      <div class="header-actions">
        <div class="lang-switch" role="group" aria-label="Language"><button type="button" data-lang="pt">PT</button><button type="button" data-lang="en">EN</button></div>
        <a class="header-cta" href="${diagnosticHref}" data-t="talk"></a>
        <button class="menu-button" type="button" aria-controls="mobile-menu" aria-expanded="false" data-menu><span></span><span></span></button>
      </div>
    </div></div>
    <nav class="mobile-menu" id="mobile-menu" hidden>
      <a href="/produtos/" data-t="navProducts"></a><a href="/portfolio/" data-t="navPortfolio"></a><a href="/reviews/" data-t="navReviews"></a><a href="${diagnosticHref}" data-t="audit"></a><a href="/contato/" data-t="navContact"></a>
    </nav>`;
  if (footer) footer.innerHTML = `
    <div class="site-footer"><div class="container">
      <div class="footer-main"><div><a class="brand" href="/"><img src="/assets/logo-geus-symbol.png" alt="" width="34" height="34"><span>geus</span></a><p class="muted" data-t="footerLine"></p></div>
      <nav class="footer-links" aria-label="Geus"><a href="/produtos/autoflux/">AutoFlux</a><a href="/produtos/madg/">MADG</a><a href="/produtos/cadia/">CADIA</a><a href="/portfolio/" data-t="navPortfolio"></a><a href="${diagnosticHref}" data-t="audit"></a><a href="/contato/" data-t="navContact"></a><a href="https://www.instagram.com/geusofc/" target="_blank" rel="noopener">Instagram ↗</a><a href="mailto:geussolucoes@gmail.com">E-mail ↗</a></nav></div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} <span data-t="rights"></span></span><span><a href="/politica-de-privacidade/" data-t="privacy"></a> · <a href="/termos-de-uso/" data-t="terms"></a></span></div>
    </div></div>`;
};

const applyLanguage = (nextLanguage, persist = true) => {
  language = nextLanguage;
  if (persist) safeSet("localStorage", LANG_KEY, language);
  document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-t]").forEach((node) => {
    const text = dictionary[language][node.dataset.t];
    if (text) node.textContent = text;
  });
  document.querySelectorAll("[data-pt][data-en]").forEach((node) => {
    node.textContent = node.dataset[language];
  });
  document.querySelectorAll("[data-pt-placeholder][data-en-placeholder]").forEach((node) => {
    node.placeholder = node.dataset[`${language}Placeholder`];
  });
  document.querySelectorAll("[data-pt-aria-label][data-en-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", node.dataset[`${language}AriaLabel`]);
  });
  document.querySelectorAll("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === language)));
  const menuButton = document.querySelector("[data-menu]");
  menuButton?.setAttribute("aria-label", dictionary[language][menuButton.getAttribute("aria-expanded") === "true" ? "closeMenu" : "menuLabel"]);
  document.querySelectorAll(".desktop-nav, .mobile-menu").forEach((node) => node.setAttribute("aria-label", dictionary[language].navLabel));
  document.querySelectorAll("[data-whatsapp-pt][data-whatsapp-en]").forEach((node) => {
    node.href = `https://wa.me/5533998347871?text=${encodeURIComponent(node.dataset[language === "pt" ? "whatsappPt" : "whatsappEn"])}`;
  });
  document.dispatchEvent(new CustomEvent("geus:language", { detail: language }));
  document.querySelectorAll("[data-contact-label]").forEach((node) => node.textContent = language === "pt" ? node.dataset.pt : node.dataset.en);
};

renderChrome();
applyLanguage(language, Boolean(storedLanguage));

if (!storedLanguage && !autoLanguage) {
  fetch("/api/locale", { headers: { Accept: "application/json" } })
    .then((response) => response.ok ? response.json() : null)
    .then((locale) => {
      if (locale?.language && !safeGet("localStorage", LANG_KEY)) {
        safeSet("sessionStorage", AUTO_LANG_KEY, locale.language);
        applyLanguage(locale.language, false);
      }
    })
    .catch(() => {});
}

const setMenuOpen = (open, restoreFocus = false) => {
  const button = document.querySelector("[data-menu]");
  const menu = document.getElementById("mobile-menu");
  if (!button || !menu) return;
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", dictionary[language][open ? "closeMenu" : "menuLabel"]);
  menu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  if (open) menu.querySelector("a")?.focus();
  else if (restoreFocus) button.focus();
};

document.addEventListener("click", (event) => {
  const langButton = event.target.closest("[data-lang]");
  if (langButton) applyLanguage(langButton.dataset.lang);
  const menuButton = event.target.closest("[data-menu]");
  if (menuButton) {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMenuOpen(open);
  }
  if (event.target.closest(".mobile-menu a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("menu-open")) return;
  if (event.key === "Escape") setMenuOpen(false, true);
  if (event.key !== "Tab") return;
  const controls = Array.from(document.querySelectorAll(".site-header a, .site-header button, .mobile-menu a")).filter((node) => node.getClientRects().length);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
matchMedia("(min-width: 981px)").addEventListener("change", (event) => { if (event.matches) setMenuOpen(false); });

const reveal = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .12 });
  reveal.forEach((node) => observer.observe(node));
} else reveal.forEach((node) => node.classList.add("is-visible"));

// One shared diagnostic powers the home and the dedicated product journeys.
window.GeusDiagnostic?.mount({ getLanguage: () => language, applyLanguage });
