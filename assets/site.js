const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

let lastScrollY = window.scrollY;
let tickingHeader = false;

const updateSmartHeader = () => {
  if (!header) return;

  const currentScrollY = window.scrollY;
  const isMenuOpen = document.body.classList.contains("menu-open");
  const delta = currentScrollY - lastScrollY;

  if (delta > 1 && currentScrollY > 160 && !isMenuOpen) {
    header.classList.add("is-hidden");
  }

  if (delta < -1 || currentScrollY < 120 || isMenuOpen) {
    header.classList.remove("is-hidden");
  }

  if (Math.abs(delta) > 1) {
    lastScrollY = Math.max(currentScrollY, 0);
  }

  tickingHeader = false;
};

const requestHeaderUpdate = () => {
  updateHeader();
  if (tickingHeader) return;
  tickingHeader = true;
  requestAnimationFrame(updateSmartHeader);
};

const closeMenu = () => {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  mobileNav.classList.remove("is-open");
  header?.classList.remove("menu-visible");
  header?.classList.remove("is-hidden");
  document.body.classList.remove("menu-open");
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  mobileNav?.classList.toggle("is-open", !isOpen);
  header?.classList.toggle("menu-visible", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1080) closeMenu();
});
window.setInterval(requestHeaderUpdate, 160);
updateHeader();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");

const revealVisibleElements = () => {
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
    if (isVisible) element.classList.add("is-visible");
  });
};

const alignHashTarget = (behavior = "smooth") => {
  const id = window.location.hash.slice(1);
  if (!id) return;

  const target = document.getElementById(decodeURIComponent(id));
  if (!target) return;

  const scrollTarget =
    id === "diagnostico" ? document.querySelector("[data-lead-form]") || target : target;
  const rect = scrollTarget.getBoundingClientRect();
  const headerOffset = header?.getBoundingClientRect().height || 0;
  const safeGap = window.innerWidth <= 660 ? 12 : 18;
  const targetTop =
    rect.height > window.innerHeight * 0.86
      ? rect.top + window.scrollY - headerOffset - safeGap
      : rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;

  window.scrollTo({ top: Math.max(0, targetTop), behavior });
  updateHeader();
  revealVisibleElements();
};

const scheduleHashAlignment = (behavior = "smooth") => {
  requestAnimationFrame(() => {
    alignHashTarget(behavior);
    window.setTimeout(() => alignHashTarget(behavior), 280);
  });
};

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.13, rootMargin: "0px 0px -40px" },
  );

  revealElements.forEach((element) => observer.observe(element));
  requestAnimationFrame(revealVisibleElements);
}

window.addEventListener("DOMContentLoaded", () => scheduleHashAlignment("auto"));
window.addEventListener("load", () => {
  scheduleHashAlignment("auto");
  window.setTimeout(() => scheduleHashAlignment("auto"), 520);
  window.setTimeout(() => scheduleHashAlignment("auto"), 1100);
});
window.addEventListener("hashchange", () => scheduleHashAlignment("smooth"));

if (window.location.hash) {
  scheduleHashAlignment("auto");
  window.setTimeout(() => scheduleHashAlignment("auto"), 80);
  window.setTimeout(() => scheduleHashAlignment("auto"), 220);
  window.setTimeout(() => scheduleHashAlignment("auto"), 520);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    closeMenu();
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    scheduleHashAlignment("smooth");
  });
});

const pushGeusEvent = (event, payload = {}) => {
  const eventPayload = {
    event,
    product: "GEUS Auto Flux",
    funnel: "diagnostico_site",
    ...payload,
  };

  window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
  window.dataLayer.push(eventPayload);
  window.__geusTrackedEvents = Array.isArray(window.__geusTrackedEvents)
    ? window.__geusTrackedEvents
    : [];
  window.__geusTrackedEvents.push(eventPayload);
  window.dispatchEvent(new CustomEvent("geus:dataLayer", { detail: eventPayload }));
};

const fieldLabels = {
  business: "Negócio",
  experience: "Experiência",
  investment: "Investimento",
  stock: "Estoque",
  name: "Nome",
  company: "Empresa",
  phone: "Telefone",
  email: "E-mail",
};

const leadStorageKey = "geus_auto_flux_lead";

const getStoredLeadPayload = () => {
  try {
    return JSON.parse(sessionStorage.getItem(leadStorageKey) || "{}");
  } catch {
    return {};
  }
};

const buildWhatsappUrlFromPayload = (leadPayload = {}) => {
  const labels = leadPayload.labels || {};
  const values = leadPayload.values || {};
  const lines = [
    "Olá! Preenchi o diagnóstico Auto Flux no site e quero conversar sobre minha operação.",
    "",
    ...Object.keys(fieldLabels)
      .map((name) => {
        const value = labels[name];
        return value ? `${fieldLabels[name]}: ${value}` : "";
      })
      .filter(Boolean),
  ];

  if (values.investment === "entender") {
    lines.push("", "Ainda quero entender melhor qual plano faz sentido.");
  }

  return `https://wa.me/5533998347871?text=${encodeURIComponent(lines.join("\n"))}`;
};

const sendLeadToEmailJS = async (leadPayload) => {
  const config = window.GEUS_EMAILJS || {};
  const hasConfig = config.publicKey && config.serviceId && config.templateId;

  if (!hasConfig) {
    pushGeusEvent("auto_flux_emailjs_not_configured", {
      qualified: leadPayload.qualified,
    });
    return false;
  }

  const templateParams = {
    product: "GEUS Auto Flux",
    qualified: leadPayload.qualified ? "Sim" : "Não",
    disqualification_reason: leadPayload.disqualificationReason || "qualificado",
    business: leadPayload.labels?.business,
    experience: leadPayload.labels?.experience,
    investment: leadPayload.labels?.investment,
    stock: leadPayload.labels?.stock,
    name: leadPayload.labels?.name,
    company: leadPayload.labels?.company,
    phone: leadPayload.labels?.phone,
    email: leadPayload.labels?.email || "Não informado",
    page_url: window.location.href,
    submitted_at: new Date().toISOString(),
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) throw new Error(`EmailJS HTTP ${response.status}`);

    pushGeusEvent("auto_flux_emailjs_sent", {
      qualified: leadPayload.qualified,
    });
    return true;
  } catch (error) {
    pushGeusEvent("auto_flux_emailjs_error", {
      qualified: leadPayload.qualified,
      error_message: error.message,
    });
    return false;
  }
};

const leadForm = document.querySelector("[data-lead-form]");

if (leadForm) {
  const steps = Array.from(leadForm.querySelectorAll("[data-form-step]"));
  const progressSteps = Array.from(leadForm.querySelectorAll("[data-progress-step]"));
  const prevButton = leadForm.querySelector("[data-form-prev]");
  const nextButton = leadForm.querySelector("[data-form-next]");
  const currentStepLabel = leadForm.querySelector("[data-current-step-label]");
  const disqualifyModal = leadForm.querySelector("[data-disqualify-modal]");
  const disqualifyTitle = leadForm.querySelector("[data-disqualify-title]");
  const disqualifyCopy = leadForm.querySelector("[data-disqualify-copy]");
  const disqualifyCancel = leadForm.querySelector("[data-disqualify-cancel]");
  const disqualifyConfirm = leadForm.querySelector("[data-disqualify-confirm]");
  let currentStep = 0;
  let midpointTracked = false;
  let pendingDisqualification = null;
  const lastValidValues = {};

  const getFieldText = (field) => {
    if (!field) return "";
    if (!field.tagName && typeof field.length === "number") {
      const selected = Array.from(field).find((item) => item.checked);
      return (
        selected?.closest(".option-card")?.querySelector("span")?.textContent?.trim() ||
        selected?.value ||
        ""
      );
    }
    return field.value.trim();
  };

  const getLeadPayload = () => {
    const formData = new FormData(leadForm);
    const values = {};
    const labels = {};

    Object.keys(fieldLabels).forEach((name) => {
      const field = leadForm.elements[name];
      values[name] = formData.get(name) || "";
      labels[name] = getFieldText(field);
    });

    const disqualificationReason =
      values.business === "fora"
        ? "nao_vende_veiculos"
        : values.investment === "sem_orcamento"
          ? "sem_orcamento"
          : "";

    return {
      values,
      labels,
      qualified: !disqualificationReason,
      disqualificationReason,
    };
  };

  const showStep = (index, shouldCenter = false) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === currentStep);
    });
    progressSteps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex <= currentStep);
    });
    leadForm.dataset.step = String(currentStep + 1);
    if (currentStepLabel) currentStepLabel.textContent = `Etapa ${currentStep + 1} de ${steps.length}`;

    if (currentStep >= 1 && !midpointTracked) {
      midpointTracked = true;
      pushGeusEvent("auto_flux_form_midpoint", {
        step: currentStep + 1,
        step_name: "investimento_estoque",
      });
    }

    if (shouldCenter) {
      const rect = leadForm.getBoundingClientRect();
      const headerOffset = header?.getBoundingClientRect().height || 0;
      const safeGap = window.innerWidth <= 660 ? 12 : 18;
      const targetTop =
        rect.height > window.innerHeight * 0.86
          ? rect.top + window.scrollY - headerOffset - safeGap
          : rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  };

  const validateCurrentStep = () => {
    const activeStep = steps[currentStep];
    const fields = Array.from(activeStep.querySelectorAll("input, textarea"));
    const invalidField = fields.find((field) => !field.checkValidity());

    if (invalidField) {
      invalidField.reportValidity();
      return false;
    }

    return true;
  };

  const redirectToThankYou = (leadPayload) => {
    sessionStorage.setItem(leadStorageKey, JSON.stringify(leadPayload));
    window.location.href = "/obrigado/";
  };

  const redirectToAgradecimento = (leadPayload) => {
    sessionStorage.setItem(leadStorageKey, JSON.stringify(leadPayload));
    const reason = encodeURIComponent(leadPayload.disqualificationReason || "fora_perfil");
    window.location.href = `/agradecimento/?motivo=${reason}`;
  };

  const openDisqualificationModal = (reason, sourceField, input) => {
    pendingDisqualification = { reason, sourceField, input };

    const modalCopy = {
      nao_vende_veiculos: {
        title: "Você confirma que não trabalha com venda de veículos?",
        copy:
          "Se essa resposta estiver certa, o Auto Flux não é o melhor caminho agora, porque a metodologia nasceu para lojas, pátios e revendedores de veículos. Se foi sem querer, volte e continue seu diagnóstico normalmente.",
      },
      sem_orcamento: {
        title: "Você confirma que ainda não tem o investimento mínimo?",
        copy:
          "Hoje o ponto de entrada do Auto Flux começa no plano Start, a partir de R$ 997/mês. Se essa resposta estiver certa, vamos te levar para o melhor próximo passo sem forçar uma conversa fora de hora.",
      },
    };

    disqualifyTitle.textContent = modalCopy[reason]?.title || "Você confirma essa resposta?";
    disqualifyCopy.textContent =
      modalCopy[reason]?.copy ||
      "Essa escolha encerra o diagnóstico por enquanto. Se foi sem querer, você pode voltar e continuar normalmente.";
    disqualifyModal.hidden = false;
    disqualifyConfirm?.focus();
  };

  const cancelDisqualification = () => {
    if (pendingDisqualification?.input) {
      const input = pendingDisqualification.input;
      const previousValue = lastValidValues[input.name];
      input.checked = false;

      if (previousValue) {
        const previousInput = leadForm.querySelector(
          `input[name="${input.name}"][value="${previousValue}"]`,
        );
        if (previousInput) previousInput.checked = true;
      }
    }

    pendingDisqualification = null;
    disqualifyModal.hidden = true;
  };

  const confirmDisqualification = async () => {
    if (!pendingDisqualification) return;
    const { reason, sourceField } = pendingDisqualification;
    const leadPayload = getLeadPayload();
    leadPayload.qualified = false;
    leadPayload.disqualificationReason = reason;

    pushGeusEvent("auto_flux_form_disqualified", {
      disqualification_reason: reason,
      source_field: sourceField,
      business: leadPayload.values.business,
      investment: leadPayload.values.investment,
    });

    await sendLeadToEmailJS(leadPayload);
    redirectToAgradecimento(leadPayload);
  };

  document.querySelectorAll('a[href="#diagnostico"]').forEach((link) => {
    link.addEventListener("click", () => {
      pushGeusEvent("auto_flux_form_open_click", {
        cta_text: link.textContent.trim().replace(/\s+/g, " "),
      });
    });
  });

  nextButton?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    showStep(currentStep + 1, true);
  });

  prevButton?.addEventListener("click", () => {
    showStep(currentStep - 1, true);
  });

  leadForm.querySelectorAll('input[name="business"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "fora" && input.checked) {
        openDisqualificationModal("nao_vende_veiculos", "business", input);
        return;
      }
      if (input.checked) lastValidValues[input.name] = input.value;
    });
  });

  leadForm.querySelectorAll('input[name="investment"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "sem_orcamento" && input.checked) {
        openDisqualificationModal("sem_orcamento", "investment", input);
        return;
      }
      if (input.checked) lastValidValues[input.name] = input.value;
    });
  });

  disqualifyCancel?.addEventListener("click", cancelDisqualification);
  disqualifyConfirm?.addEventListener("click", confirmDisqualification);

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    const leadPayload = getLeadPayload();

    pushGeusEvent("auto_flux_form_submit", {
      qualified: leadPayload.qualified,
      disqualification_reason: leadPayload.disqualificationReason || "qualificado",
      business: leadPayload.values.business,
      investment: leadPayload.values.investment,
      stock: leadPayload.values.stock,
    });

    await sendLeadToEmailJS(leadPayload);
    redirectToThankYou(leadPayload);
  });

  showStep(0);
}

const qualifiedThankPage = document.querySelector("[data-thank-qualified]");

if (qualifiedThankPage) {
  const leadPayload = getStoredLeadPayload();
  const whatsappResult = qualifiedThankPage.querySelector("[data-whatsapp-result]");
  const leadSummary = qualifiedThankPage.querySelector("[data-lead-summary] strong");

  if (whatsappResult) {
    whatsappResult.href = buildWhatsappUrlFromPayload(leadPayload);
    whatsappResult.addEventListener("click", () => {
      pushGeusEvent("auto_flux_thank_you_whatsapp_click", {
        qualified: true,
        business: leadPayload.values?.business,
        investment: leadPayload.values?.investment,
        stock: leadPayload.values?.stock,
      });
    });
  }

  if (leadSummary && leadPayload.labels?.company) {
    leadSummary.textContent = `${leadPayload.labels.company}: ${leadPayload.labels.investment || "diagnóstico recebido"} · ${leadPayload.labels.stock || "estoque informado"}.`;
  }

  pushGeusEvent("auto_flux_thank_you_view", {
    qualified: true,
    disqualification_reason: "qualificado",
  });
}

const unqualifiedThankPage = document.querySelector("[data-thank-unqualified]");

if (unqualifiedThankPage) {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("motivo") || getStoredLeadPayload().disqualificationReason || "fora_perfil";
  const heading = unqualifiedThankPage.querySelector("[data-unqualified-heading]");
  const copy = unqualifiedThankPage.querySelector("[data-unqualified-copy]");
  const instagramButton = unqualifiedThankPage.querySelector("[data-instagram-result]");

  const reasonCopy = {
    nao_vende_veiculos: {
      heading: "Quando o caminho for venda de veículos, a GEUS pode entrar com força.",
      copy:
        "Obrigado por responder com clareza. Neste momento, o Auto Flux é focado em lojas, pátios e revendedores de veículos. Mesmo que agora não seja o encaixe certo, fica perto da GEUS: conteúdos, novidades e futuras soluções podem fazer sentido no seu próximo movimento.",
    },
    sem_orcamento: {
      heading: "Seu momento foi entendido — e isso também é estratégia.",
      copy:
        "Obrigado por responder sem enrolação. Hoje o Auto Flux começa no plano Start, a partir de R$ 997/mês, e talvez ainda não seja a hora ideal de entrar. Fica perto da GEUS: conteúdos e novidades podem te ajudar a preparar o próximo movimento com mais segurança.",
    },
  };

  heading.textContent = reasonCopy[reason]?.heading || "Talvez esse ainda não seja o momento certo.";
  copy.textContent =
    reasonCopy[reason]?.copy ||
    "Obrigado por responder. Mesmo que agora não seja o encaixe ideal, siga a GEUS para acompanhar conteúdos, novidades e futuras soluções.";

  instagramButton?.addEventListener("click", () => {
    pushGeusEvent("auto_flux_unqualified_instagram_click", {
      qualified: false,
      disqualification_reason: reason,
    });
  });

  pushGeusEvent("auto_flux_unqualified_thank_you_view", {
    qualified: false,
    disqualification_reason: reason,
  });
}
