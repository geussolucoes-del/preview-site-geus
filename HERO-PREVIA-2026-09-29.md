# Hero — prévia para aprovação visual

Prévia inicialmente entregue sem publicação. Em 29/09/2026, o usuário aprovou a publicação desta composição na main. Os rótulos embutidos permanecem em português; as observações de legibilidade abaixo continuam válidas. Prévia local em http://127.0.0.1:4173/.

## Escopo

Somente quadro à direita do hero: `<picture>` com desktop 1402×1122 e mobile 1536×1024 até 680px; dimensões declaradas, enquadramento integral, `object-fit: contain`, prioridade de carregamento e descrição acessível PT/EN. Min-height antigo neutralizado apenas no novo quadro. Entre 681 e 980px, largura máxima 564px e centralização.

Textos, CTAs, nome, logo original e demais seções preservados. A versão de CSS na home passou de v16 para v17, sem alteração nas referências de outras páginas. As imagens PNG do ZIP foram importadas sem edição (cerca de 2,97 MB desktop e 1,75 MB mobile).

## Marca

O símbolo original `/assets/logo-geus-symbol.png` é sobreposto na área escura da marca gerada, cobrindo apenas o símbolo antigo. O nome “geus” e os rótulos da arte ficam intactos. Nenhum filtro ou redesenho foi aplicado ao símbolo; arquivo byte a byte igual ao Git. A máscara escura ficou sem emenda perceptível nas capturas inspecionadas, mas a aprovação visual final é do usuário.

## Testes reais

Chromium, viewport de altura 900px, fontes e imagens carregadas, animações reduzidas e opcionais de cookies recusados para não obstruir a revisão. Nenhum envio de formulário. Local `/api/locale` simulado em PT; seletor real PT/EN testado em cada largura.

| Largura | Quadro medido (px) | Arte |
|---|---|---|
| 390 | 354 × 236 | Mobile |
| 430 | 394 × 262,7 | Mobile |
| 768 | 564 × 451,4 | Desktop, centralizado |
| 1024 | 421,5 × 337,3 | Desktop |
| 1366 | 572,5 × 458,2 | Desktop |

Sem rolagem horizontal ou erro JavaScript nos cinco tamanhos, PT e EN. Dimensões naturais e troca de source confirmadas. Capturas de viewport, hero completo e inglês em `.playwright-cli/hero-preview-{largura}-{pt|en}.png` e `.playwright-cli/hero-preview-{largura}-pt-hero.png`.

## Pontos para avaliação

- Mobile: VOLUME / CRESCIMENTO / ESTRATÉGIA ficam legíveis visualmente no tamanho normal. Desktop: os rótulos de apoio são pequenos, especialmente a 1024px (a arte tem só 419px úteis). Preservar a composição integral impede aumentar só esses textos por CSS.
- Em 1024px, o título existente quebra “Crescimento” em duas linhas. Fonte/largura da coluna de texto não foram modificadas; trata-se de limitação anterior, mantida por respeito ao escopo. Precisa de autorização separada para alterar tipografia/breakpoint do texto.
- O seletor EN traduz o conteúdo HTML e a descrição acessível, mas não os pixels das imagens. As duas artes precisam de variantes EN, com VOLUME / STRATEGY + QUALIFICATION / GROWTH / PREDICTABILITY no desktop e VOLUME / STRATEGY / GROWTH no mobile, mantendo a marca “geus”.
- A marca foi integrada via CSS, não foi alterada no PNG aprovado. Confirmar visualmente o símbolo antes de publicar.

Verificação reproduzível: `tests/verify-hero-preview.js` e `tests/hero-preview.test.mjs`. Orientações de interface influenciaram dimensões declaradas, descrição acessível, redução de movimento e checagem de idiomas, sem expandir a alteração para outras seções.
