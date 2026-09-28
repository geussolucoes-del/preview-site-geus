(() => {
  "use strict";

  const products = Object.freeze({ autoflux: "Auto Flux", madg: "MADG", cadia: "CADIA", geral: "Projeto personalizado" });
  const aliases = { adg: "madg", auto_flux: "autoflux", autofluxo: "autoflux", "auto-flux": "autoflux" };
  const normalizeProduct = (value) => {
    const key = String(value || "").trim().toLowerCase();
    return aliases[key] || key;
  };
  const resolveProduct = (form) => {
    // O produto declarado na página tem precedência sobre parâmetros de campanha.
    const key = normalizeProduct(
      form?.dataset.product || document.body.dataset.product ||
      new URLSearchParams(window.location.search).get("produto"),
    );
    if (!Object.hasOwn(products, key)) throw new Error("Produto não identificado.");
    return { id: key, name: products[key] };
  };

  const buildTemplateParams = (lead) => {
    const productId = normalizeProduct(lead.productId);
    if (!Object.hasOwn(products, productId)) throw new Error("Produto não identificado.");
    const labels = lead.labels || {};
    const answers = lead.answers || [];
    return {
      product: products[productId],
      product_id: productId,
      qualified: lead.qualified === true ? "Sim" : lead.qualified === false ? "Não" : "A avaliar",
      disqualification_reason: lead.disqualificationReason || "",
      name: labels.name || "Não informado",
      company: labels.company || "Não informado",
      phone: labels.phone || "Não informado",
      email: labels.email || "Não informado",
      // Mantém compatibilidade com o template anterior do Auto Flux.
      business: labels.business || "Não informado",
      experience: labels.experience || "Não informado",
      investment: labels.investment || "Não informado",
      stock: labels.stock || "Não informado",
      answers: answers.map(({ question, answer }) => `${question}: ${answer || "Não informado"}`).join("\n"),
      page_url: lead.pageUrl || window.location.href,
      source_cta: lead.sourceCta || "Acesso direto ao formulário",
      submitted_at: new Date().toISOString(),
      privacy_consent: lead.privacyConsent ? "Sim" : "Não",
    };
  };

  const inFlight = new Set();
  const send = async (lead) => {
    const config = window.GEUS_EMAILJS || {};
    if (![config.publicKey, config.serviceId, config.templateId].every((value) => typeof value === "string" && value.trim())) {
      const error = new Error("Envio ainda não configurado.");
      error.code = "not_configured";
      throw error;
    }
    if (!lead.privacyConsent || !lead.labels?.name?.trim() || !lead.labels?.phone?.trim()) {
      throw new Error("Preencha seus dados e confirme a Política de Privacidade.");
    }
    const params = buildTemplateParams(lead);
    // Evita duas requisições simultâneas pelo mesmo formulário.
    if (inFlight.has(params.product_id)) throw new Error("Envio já em andamento.");
    inFlight.add(params.product_id);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          template_params: params,
        }),
      });
      if (!response.ok) {
        const error = new Error(`EmailJS HTTP ${response.status}`);
        error.code = response.status === 429 ? "rate_limit" : "provider_error";
        throw error;
      }
      return { productId: params.product_id, accepted: true };
    } finally {
      window.clearTimeout(timer);
      inFlight.delete(params.product_id);
    }
  };

  window.GEUSLeadService = Object.freeze({ resolveProduct, buildTemplateParams, send });
})();
