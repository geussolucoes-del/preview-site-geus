# Preparação do Google Tag Manager

O banner e o carregador estão preparados, mas nenhum contêiner real foi instalado. `assets/tag-config.js` mantém `gtmId` vazio. Não cole outro snippet nem iframe noscript por fora desse fluxo: isso contornaria o bloqueio.

## Fluxo implementado

- Consent Mode v2 recebe defaults negados para analytics_storage, ad_storage, ad_user_data e ad_personalization antes de qualquer carregamento do contêiner.
- Modo básico: o GTM só pode carregar após autorização de alguma categoria opcional. Recusa total e ausência de escolha não fazem requisição ao Google.
- Aceitação por categoria atualiza o consentimento antes do carregamento. O evento `cookie_consent_update` carrega apenas analytics_consent e marketing_consent, sem contato ou respostas.
- Preferência versionada em localStorage, válida por 180 dias. Expiração/registro inválido volta ao padrão negado. Revisão disponível em todas as páginas pelo rodapé.
- Reduzir uma autorização após o contêiner carregar recarrega a página para interromper scripts em execução. Remoção de cookies conhecidos é limitada a cookies legíveis e acessíveis ao domínio; não garante remoção de cookies de terceiros/HttpOnly nem desfaz processamento anterior.
- O formulário e o EmailJS não dependem de autorização de análise/publicidade.

## Configuração obrigatória quando o ID chegar

1. Definir o ID real `GTM-...` em `assets/tag-config.js` e atualizar a versão do asset em todas as páginas.
2. No GTM, configurar **Additional Consent Checks** em cada tag. Análise deve exigir analytics_storage; publicidade deve exigir ad_storage, ad_user_data e ad_personalization. Isso evita pings de tags Google com consentimento negado quando o contêiner foi carregado pela outra categoria.
3. Tags de Meta Pixel/HTML personalizado também precisam dos checks da categoria publicidade. Consent Mode sozinho não bloqueia toda tag de terceiros.
4. Tags de pageview podem usar o carregamento inicial e a atualização de consentimento com deduplicação. Se a categoria for autorizada depois de o contêiner já estar carregado, usar cookie_consent_update para iniciar a medição, sem duplicar disparos.
5. Validar em Tag Assistant + Network: nenhuma requisição antes da escolha/na recusa, análise apenas sem publicidade, publicidade apenas sem análise, mudança de preferência e retirada.
6. Atualizar política/inventário com os fornecedores, cookies, finalidades e prazos efetivamente utilizados. Se as finalidades mudarem, incrementar VERSION em consent.js para solicitar nova decisão.

Não considerar o GTM pronto para campanhas antes desses checks. Não enviar dados pessoais ou respostas de qualificação ao dataLayer.

Fontes: [Google — implementação de consentimento](https://developers.google.com/tag-platform/security/guides/consent), [Google — consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [Vercel — 404 estática](https://vercel.com/kb/guide/custom-404-page).
