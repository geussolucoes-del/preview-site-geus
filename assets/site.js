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

const alignHashTarget = () => {
  const id = window.location.hash.slice(1);
  if (!id) return;

  const target = document.getElementById(decodeURIComponent(id));
  if (!target) return;

  target.scrollIntoView({ block: "start" });
  updateHeader();
  revealVisibleElements();
};

const scheduleHashAlignment = () => {
  requestAnimationFrame(() => {
    alignHashTarget();
    window.setTimeout(alignHashTarget, 280);
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
  window.addEventListener("load", scheduleHashAlignment);
  window.addEventListener("hashchange", scheduleHashAlignment);
}

const leadForm = document.querySelector("[data-lead-form]");

if (leadForm) {
  const steps = Array.from(leadForm.querySelectorAll("[data-form-step]"));
  const progressSteps = Array.from(leadForm.querySelectorAll("[data-progress-step]"));
  const prevButton = leadForm.querySelector("[data-form-prev]");
  const nextButton = leadForm.querySelector("[data-form-next]");
  const qualifiedResult = leadForm.querySelector("[data-qualified-result]");
  const unqualifiedResult = leadForm.querySelector("[data-unqualified-result]");
  const whatsappResult = leadForm.querySelector("[data-whatsapp-result]");
  let currentStep = 0;
  let midpointTracked = false;

  const pushDataLayerEvent = (event, payload = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      product: "GEUS Auto Flux",
      funnel: "diagnostico_site",
      ...payload,
    });
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

  const getFieldText = (field) => {
    if (!field) return "";
    if (field.tagName === "SELECT") {
      return field.selectedOptions[0]?.textContent?.trim() || "";
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

  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === currentStep);
    });
    progressSteps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex <= currentStep);
    });
    leadForm.dataset.step = String(currentStep + 1);

    if (currentStep >= 1 && !midpointTracked) {
      midpointTracked = true;
      pushDataLayerEvent("auto_flux_form_midpoint", {
        step: currentStep + 1,
        step_name: "investimento_estoque",
      });
    }
  };

  const validateCurrentStep = () => {
    const activeStep = steps[currentStep];
    const fields = Array.from(activeStep.querySelectorAll("input, select, textarea"));
    const invalidField = fields.find((field) => !field.checkValidity());

    if (invalidField) {
      invalidField.reportValidity();
      return false;
    }

    return true;
  };

  const buildWhatsappUrl = () => {
    const leadPayload = getLeadPayload();
    const lines = [
      "Olá! Preenchi o diagnóstico Auto Flux no site e quero conversar sobre minha loja.",
      "",
      ...Object.keys(fieldLabels)
        .map((name) => {
          const value = leadPayload.labels[name];
          return value ? `${fieldLabels[name]}: ${value}` : "";
        })
        .filter(Boolean),
    ];

    if (leadPayload.values.investment === "entender") {
      lines.push("", "Ainda quero entender melhor qual plano faz sentido.");
    }

    return `https://wa.me/5533998347871?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const sendLeadToEmailJS = async (leadPayload) => {
    const config = window.GEUS_EMAILJS || {};
    const hasConfig = config.publicKey && config.serviceId && config.templateId;

    if (!hasConfig) {
      pushDataLayerEvent("auto_flux_emailjs_not_configured", {
        qualified: leadPayload.qualified,
      });
      return false;
    }

    const templateParams = {
      product: "GEUS Auto Flux",
      qualified: leadPayload.qualified ? "Sim" : "Não",
      disqualification_reason: leadPayload.disqualificationReason || "qualificado",
      business: leadPayload.labels.business,
      experience: leadPayload.labels.experience,
      investment: leadPayload.labels.investment,
      stock: leadPayload.labels.stock,
      name: leadPayload.labels.name,
      company: leadPayload.labels.company,
      phone: leadPayload.labels.phone,
      email: leadPayload.labels.email || "Não informado",
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

      pushDataLayerEvent("auto_flux_emailjs_sent", {
        qualified: leadPayload.qualified,
      });
      return true;
    } catch (error) {
      pushDataLayerEvent("auto_flux_emailjs_error", {
        qualified: leadPayload.qualified,
        error_message: error.message,
      });
      return false;
    }
  };

  const showResult = (leadPayload) => {
    leadForm.classList.add("is-complete");
    qualifiedResult.hidden = !leadPayload.qualified;
    unqualifiedResult.hidden = leadPayload.qualified;

    if (leadPayload.qualified && whatsappResult) {
      whatsappResult.href = buildWhatsappUrl();
    }

    pushDataLayerEvent("auto_flux_thank_you_view", {
      qualified: leadPayload.qualified,
      disqualification_reason: leadPayload.disqualificationReason || "qualificado",
    });

    leadForm.scrollIntoView({ block: "center" });
  };

  document.querySelectorAll('a[href="#diagnostico"]').forEach((link) => {
    link.addEventListener("click", () => {
      pushDataLayerEvent("auto_flux_form_open_click", {
        cta_text: link.textContent.trim().replace(/\s+/g, " "),
      });
    });
  });

  nextButton?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    showStep(currentStep + 1);
  });

  prevButton?.addEventListener("click", () => {
    showStep(currentStep - 1);
  });

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    const leadPayload = getLeadPayload();

    pushDataLayerEvent("auto_flux_form_submit", {
      qualified: leadPayload.qualified,
      disqualification_reason: leadPayload.disqualificationReason || "qualificado",
      business: leadPayload.values.business,
      investment: leadPayload.values.investment,
      stock: leadPayload.values.stock,
    });

    sendLeadToEmailJS(leadPayload);
    showResult(leadPayload);
  });

  whatsappResult?.addEventListener("click", () => {
    const leadPayload = getLeadPayload();
    pushDataLayerEvent("auto_flux_thank_you_whatsapp_click", {
      qualified: leadPayload.qualified,
      business: leadPayload.values.business,
      investment: leadPayload.values.investment,
      stock: leadPayload.values.stock,
    });
  });

  showStep(0);
}
