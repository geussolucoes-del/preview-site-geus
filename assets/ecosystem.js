const LANG_KEY = "geus_language";
const AUTO_LANG_KEY = "geus_auto_language";
const isPortuguese = (navigator.language || "").toLowerCase().startsWith("pt");
const storedLanguage = localStorage.getItem(LANG_KEY);
const autoLanguage = sessionStorage.getItem(AUTO_LANG_KEY);
let language = storedLanguage || autoLanguage || (isPortuguese ? "pt" : "en");

const dictionary = {
  pt: {
    skip: "Ir para o conteúdo", navProducts: "Produtos", navPortfolio: "Portfólio", navReviews: "Reviews", navContact: "Contato", talk: "Falar agora",
    menuLabel: "Abrir menu", footerLine: "Tecnologia e crescimento construídos de perto para negócios reais.", rights: "Geus Soluções. Todos os direitos reservados."
  },
  en: {
    skip: "Skip to content", navProducts: "Products", navPortfolio: "Portfolio", navReviews: "Reviews", navContact: "Contact", talk: "Talk to us",
    menuLabel: "Open menu", footerLine: "Technology and growth built closely around real businesses.", rights: "Geus Solutions. All rights reserved."
  }
};

const currentPath = location.pathname.replace(/\/$/, "") || "/";
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
        <a class="header-cta" href="/diagnostico/" data-t="talk"></a>
        <button class="menu-button" type="button" aria-controls="mobile-menu" aria-expanded="false" data-menu><span></span><span></span></button>
      </div>
    </div></div>
    <nav class="mobile-menu" id="mobile-menu" hidden>
      <a href="/produtos/" data-t="navProducts"></a><a href="/portfolio/" data-t="navPortfolio"></a><a href="/reviews/" data-t="navReviews"></a><a href="/diagnostico/">Diagnóstico / Audit</a><a href="/contato/" data-t="navContact"></a>
    </nav>`;
  if (footer) footer.innerHTML = `
    <footer class="site-footer"><div class="container">
      <div class="footer-main"><div><a class="brand" href="/"><img src="/assets/logo-geus-symbol.png" alt="" width="34" height="34"><span>geus</span></a><p class="muted" data-t="footerLine"></p></div>
      <nav class="footer-links"><a href="/produtos/">AutoFlux + MADG</a><a href="/portfolio/" data-t="navPortfolio"></a><a href="/diagnostico/">Diagnóstico</a><a href="/contato/" data-t="navContact"></a><a href="https://www.instagram.com/geusofc/" target="_blank" rel="noopener">Instagram ↗</a><a href="mailto:geussolucoes@gmail.com">E-mail ↗</a></nav></div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} <span data-t="rights"></span></span><span><a href="/politica-de-privacidade/">Privacidade</a> · <a href="/termos-de-uso/">Termos</a></span></div>
    </div></footer>`;
};

const applyLanguage = (nextLanguage, persist = true) => {
  language = nextLanguage;
  if (persist) localStorage.setItem(LANG_KEY, language);
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
  document.querySelectorAll("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === language)));
  document.querySelector("[data-menu]")?.setAttribute("aria-label", dictionary[language].menuLabel);
  document.querySelectorAll("[data-contact-label]").forEach((node) => node.textContent = language === "pt" ? node.dataset.pt : node.dataset.en);
};

renderChrome();
applyLanguage(language, Boolean(storedLanguage));

if (!storedLanguage && !autoLanguage) {
  fetch("/api/locale", { headers: { Accept: "application/json" } })
    .then((response) => response.ok ? response.json() : null)
    .then((locale) => {
      if (locale?.language && !localStorage.getItem(LANG_KEY)) {
        sessionStorage.setItem(AUTO_LANG_KEY, locale.language);
        applyLanguage(locale.language, false);
      }
    })
    .catch(() => {});
}

document.addEventListener("click", (event) => {
  const langButton = event.target.closest("[data-lang]");
  if (langButton) applyLanguage(langButton.dataset.lang);
  const menuButton = event.target.closest("[data-menu]");
  if (menuButton) {
    const menu = document.getElementById("mobile-menu");
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  }
});

const reveal = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .12 });
  reveal.forEach((node) => observer.observe(node));
} else reveal.forEach((node) => node.classList.add("is-visible"));

document.querySelectorAll("[data-diagnostic-form]").forEach((form) => {
  const steps = Array.from(form.querySelectorAll("[data-form-step]"));
  const progress = Array.from(form.querySelectorAll("[data-progress]"));
  const previousButton = form.querySelector("[data-form-prev]");
  const nextButton = form.querySelector("[data-form-next]");
  const submitButton = form.querySelector("[data-form-submit]");
  const stepLabel = form.querySelector("[data-form-step-label]");
  let currentStep = 0;

  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });
    progress.forEach((item, stepIndex) => item.classList.toggle("is-active", stepIndex <= currentStep));
    previousButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    form.dataset.step = String(currentStep);
    if (stepLabel) stepLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  };

  const validateCurrentStep = () => {
    const fields = Array.from(steps[currentStep].querySelectorAll("input, select, textarea"));
    const invalidField = fields.find((field) => !field.checkValidity());
    if (!invalidField) return true;
    invalidField.reportValidity();
    return false;
  };

  const requestedProduct = new URLSearchParams(window.location.search).get("produto");
  if (requestedProduct) {
    const needField = form.querySelector('[name="Necessidade"]');
    if (needField && Array.from(needField.options).some((option) => option.value === requestedProduct)) {
      needField.value = requestedProduct;
    }
    if (requestedProduct === "autoflux") {
      document.body.classList.add("diagnostic-autoflux");
      document.querySelectorAll("[data-autoflux-pt][data-autoflux-en]").forEach((node) => {
        node.dataset.pt = node.dataset.autofluxPt;
        node.dataset.en = node.dataset.autofluxEn;
      });
      const segmentField = form.querySelector('[name="Segmento"]');
      if (segmentField && !segmentField.value) segmentField.value = language === "pt" ? "Automotivo / loja de veículos" : "Automotive / vehicle dealership";
      const plan = new URLSearchParams(window.location.search).get("plano");
      if (plan) {
        const planField = document.createElement("input");
        planField.type = "hidden";
        planField.name = "Plano AutoFlux";
        planField.value = plan.toUpperCase();
        form.append(planField);
      }
      applyLanguage(language, false);
    }
  }

  nextButton?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    showStep(currentStep + 1);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  previousButton?.addEventListener("click", () => {
    showStep(currentStep - 1);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateCurrentStep() || !form.reportValidity()) return;
    const data = new FormData(form);
    const lines = language === "pt"
      ? ["Olá! Preenchi o diagnóstico estratégico da Geus."]
      : ["Hi! I completed the Geus strategic audit."];
    for (const [key, value] of data.entries()) {
      if (String(value).trim()) lines.push(`${key}: ${value}`);
    }
    const url = `https://wa.me/5533998347871?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
    const success = form.querySelector("[data-form-success]");
    if (success) {
      success.hidden = false;
      success.textContent = language === "pt"
        ? "Diagnóstico preparado. Abrimos o WhatsApp para você enviar."
        : "Audit prepared. WhatsApp is open for you to send it.";
    }
  });

  showStep(0);
});
