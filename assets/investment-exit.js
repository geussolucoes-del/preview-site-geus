(() => {
  const params=new URLSearchParams(location.search);
  const product=params.get('produto');
  if(params.get('motivo')!=='investimento'||!Object.hasOwn(window.GeusDiagnostic.minimums,product))return;
  const {name,amount,amountEn}=window.GeusDiagnostic.minimums[product];
  const copy=document.querySelector('[data-investment-exit]');
  copy.dataset.pt=`Para começar com o ${name}, o investimento mínimo é de ${amount}. Como esse valor ainda não está disponível, vamos respeitar seu momento — sem pressionar você a assumir um compromisso agora.`;
  copy.dataset.en=`Getting started with ${name} requires a minimum investment of ${amountEn}. Since this budget is not currently available, we respect your timing — without pressuring you into a commitment now.`;
  copy.textContent=copy.dataset.pt;
})();
