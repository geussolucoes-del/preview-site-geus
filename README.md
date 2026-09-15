# Preview Site Geus

Build estatico do site Geus Solucoes, pronto para preview/deploy na Vercel.

## Deploy na Vercel

- Framework Preset: Other
- Build Command: deixar vazio
- Output Directory: `.`

## CADIA

Produto em `/produtos/cadia/`, integrado à home, ao catálogo e ao diagnóstico.
HTML semântico, estilos específicos em `assets/cadia.css` e formulário compartilhado
em `assets/ecosystem.js`. Sem framework ou etapa de build.

- Direção do produto: `DIRETRIZ_PRODUTO_CADIA.md`.
- CTAs: `/diagnostico/?produto=cadia`; modo opcional `assistida`, `supervisionada` ou `autonoma`.
- Idiomas: PT/EN, seguindo os atributos `data-pt` e `data-en` do site.
- Oferta: implantação a partir de R$ 1.500; operação recorrente e integrações sob proposta.
- Escopo desta entrega: apresentação comercial. Não provisiona OpenClaw, WhatsApp, CRM ou pagamentos.

## Verificação

Execute `node --test tests/cadia.test.mjs` (Node 20+; sem dependências).
Para servir localmente: `python3 -m http.server 4173`.
Abra `/tests/responsive.html` para conferir CADIA, catálogo, home e diagnóstico em
viewports de 320 a 1440 px. A ferramenta é `noindex` e fica fora da navegação pública.
Teste os dois idiomas, o menu com teclado, os links e o formulário em três etapas.
O diagnóstico apenas prepara a mensagem para o WhatsApp; o usuário ainda precisa enviá-la.
