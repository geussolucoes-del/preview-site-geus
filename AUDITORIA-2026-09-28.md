# Curadoria do site — 28/09/2026

## Complemento posterior: banner e 404

A pedido do usuário, foi acrescentado banner preparatório para GTM em todas as páginas, inclusive legais e 404. As observações abaixo sobre ausência de banner descrevem a primeira rodada histórica da auditoria, anterior a este complemento.

- Aceitar, rejeitar, personalizar análise/publicidade, revisão no rodapé, validade de 180 dias e opções desmarcadas por padrão. Interface PT/EN e modal nativo com Escape/foco.
- Consent Mode v2 negado por padrão; carregamento básico condicionado à autorização. ID real vazio, nenhum GTM/Pixel instalado. Requisitos de checks por tag documentados em `GTM-CONSENTIMENTO.md`.
- 404 personalizada com links seguros para home/produtos, assets absolutos e noindex; sem WhatsApp ou redirecionamento para falso sucesso.
- 31 testes Node passaram. Navegador testou banner/modal em quatro larguras, rejeição persistida, aceitação, categorias separadas, expiração e retirada, com contêiner simulado sem tags reais. Políticas atualizadas para registrar essa preferência.
- Nova varredura: 15 páginas em quatro larguras, sem transbordamento ou links internos quebrados. Após recusar opcionais, os envios simulados dos três produtos e a página de obrigado continuaram funcionando.
- Verificação pública pós-deploy: banner visível, preferência recuperável no rodapé, rota inexistente devolve a 404 personalizada com status HTTP 404, link de recuperação retorna à home e nenhuma requisição a GTM/Analytics/Pixel. Teste reproduzível em `tests/verify-consent-live.js`.

## Resultado e correções

- Varredura de 14 rotas em 320, 390, 768 e 1366 px, PT/EN: nenhum transbordamento horizontal, imagem quebrada ou link interno sem destino. Revisão visual adicional dos planos e tabelas legais; corrigidos selo do Pro e quebras no inventário de armazenamento.
- WhatsApp restrito ao obrigado após envio confirmado; CTAs de MADG e contato agora passam pelo diagnóstico. Formulário único e contexto de produto preservados.
- Link de Consolidados corrigido para https://consolidados.com.ar/ (o endereço com www retornava 404). Outros nove destinos externos conferidos; redes sociais não avaliadas por HTTP automatizado.
- Privacidade atualizada para envio via EmailJS/Gmail, hospedagem Vercel, triagem automatizada, finalidade do contato e revisão humana por e-mail. Empresa/CNPJ no rodapé; endereço pessoal não publicado.
- Cookies descrevem os registros funcionais reais em localStorage/sessionStorage. Não há tags de Analytics/Ads/Pixel no código atual: não foi criado um banner com consentimento fictício para publicidade inexistente. DataLayer apenas em memória, sem respostas ou dados de contato.
- Termos preservam a força legal das ofertas e distinguem escopo, moeda, mensalidade e filtro. Isso não constitui certificação jurídica.
- Sitemap inclui políticas/termos e exclui formulário genérico, recibos e reviews ainda em construção. Formulários/recibos/reviews têm noindex. Schema da home usa Organization, sem endereço ou avaliações inventadas.
- Aliases permanentes /privacidade, /cookies e /termos; headers nosniff, política de referência, proteção contra frames e restrição de câmera/microfone/geolocalização.

## Preços publicados com fidelidade

| Produto/oferta | Preço existente preservado | Requisito do formulário |
|---|---|---|
| AutoFlux Start | R$ 997/mês; referência EN US$ 199.40/mês | R$ 2.000 / US$ 400 disponíveis para começar |
| AutoFlux Pro | R$ 1.797/mês; referência EN US$ 359.40/mês; até R$ 350 de mídia inclusa | Mesmo filtro de entrada |
| AutoFlux Premium | R$ 3.497/mês; referência EN US$ 699.40/mês; até R$ 1.200 de mídia inclusa | Mesmo filtro de entrada |
| MADG | Escopo/investimento final definidos por diagnóstico, sem mensalidade fixa inventada | R$ 2.000 / US$ 400 |
| CADIA | Implantação a partir de R$ 1.500 / US$ 300; recorrência à parte | R$ 1.500 / US$ 300 |

As equivalências usam a referência fixa fornecida de R$ 5 por dólar, não cotação em tempo real. A proposta deve informar moeda de cobrança e custos adicionais. O mínimo do filtro não foi tratado como uma nova mensalidade. Os níveis do CADIA representam autonomia, não três mensalidades fechadas.

## Evidências e limites

- 27 testes Node passaram: validação, produto travado, payload/template único, eventos sem PII, valores, links e metadados.
- Navegador: envio simulado para três produtos, falta de configuração, falha HTTP com preservação de respostas, obrigado só após aceite, confirmação/cancelamento/Escape da desqualificação e saída Instagram. Nenhum e-mail real enviado nesta auditoria.
- Menu mobile: abre, fecha com Escape e devolve foco. Capturas locais em `.playwright-cli`, não publicadas.
- Baseline público da home: Lighthouse acessibilidade/best practices/SEO/agentic browsing 100; 56 verificações aprovadas. Não equivale a auditoria de todas as páginas nem garantia de ranking.
- Trace de uma recarga mobile (390x844, Fast 4G, CPU 4x): LCP 1.928 ms, CLS 0.00. Sem CrUX/INP de usuários reais; não é mediana de execuções frias. Antivírus local injetava recursos próprios, não tags do site.
- Scripts reproduzíveis: `tests/verify-site-audit.js`, `tests/verify-audit-visual.js`, `emailjs/verify-browser.js`, `emailjs/verify-investment.js`.

## Antes de ativar publicidade e Search Console

1. Ao instalar GTM/Ads/Analytics/Pixel, implementar bloqueio/consentimento das categorias opcionais, rejeição e revogação; atualizar inventário. Eventos preparados não significam tags de Google Ads instaladas.
2. Validar internamente prazos de retenção na caixa de e-mail, contratos com operadores e mecanismos de transferência internacional. O aviso público não substitui esses procedimentos.
3. Revisão jurídica humana recomendada para a operação real; comprovar as alegações de resultados usadas no AutoFlux.
4. Verificar propriedade do domínio no Search Console e enviar `/sitemap.xml`. Nenhuma submissão ou indexação foi realizada nesta auditoria; Google decide indexação/ranking.

## Referências primárias

- [ANPD — Guia de cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf/@@display-file/file)
- [LGPD — texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [Google — requisitos técnicos](https://developers.google.com/search/docs/essentials/technical?hl=pt-br)
- [Google — sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
