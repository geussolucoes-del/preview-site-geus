(() => {
  let receipt;
  try { receipt = JSON.parse(sessionStorage.getItem('geus_diagnostic_receipt') || 'null'); } catch {}
  if (!receipt?.message || !['autoflux','madg','cadia','geral'].includes(receipt.product)) return;
  const title = document.querySelector('[data-receipt-title]');
  const copy = document.querySelector('[data-receipt-copy]');
  title.dataset.pt = 'Seu diagnóstico chegou. Agora o próximo passo tem contexto.';
  title.dataset.en = 'Your diagnostic is in. Now the next step has context.';
  copy.dataset.pt = 'Obrigado por compartilhar o momento da sua empresa. A equipe Geus recebeu suas respostas para uma avaliação individualizada. Se quiser continuar a conversa agora, seu contexto também vai junto pelo WhatsApp.';
  copy.dataset.en = 'Thank you for sharing your business context. The Geus team received your answers for an individual assessment. If you would like to continue now, your context also goes with you on WhatsApp.';
  const button = document.querySelector('[data-thank-whatsapp]');
  button.hidden = false;
  button.href = 'https://wa.me/5533998347871?text=' + encodeURIComponent(receipt.message);
  document.querySelector('[data-start-diagnostic]').hidden = true;
  window.GeusDiagnostic.track('diagnostic_thank_you_view', receipt.product);
  button.addEventListener('click', () => {
    window.GeusDiagnostic.track('diagnostic_thank_you_whatsapp_click', receipt.product);
    window.GeusDiagnostic.track('diagnostic_whatsapp_open', receipt.product);
  });
})();
