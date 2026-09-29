# Hero transparente — prévia para avaliação

Alteração local, sem commit, push ou publicação na main.

## Escopo

- PNGs do ZIP importadas sem edição para `images/hero-geus-transparent/`.
- `picture` troca para a arte mobile até 680px; dimensões naturais e descrição acessível mantidas.
- Contêiner sem borda, fundo ou recorte. Altura mínima antiga anulada apenas nesta ilustração.
- Desktop amplia a arte até a borda direita, mantendo 24px após o bloco de texto.
- De 681 a 980px, arte centralizada com largura máxima de 564px.
- Símbolo oficial sobre a representação gerada, sem duplicação visível. Arquivo oficial confirmado byte a byte inalterado.
- Textos, botões e demais seções preservados.

## Verificação real no navegador

| Tela | Arte exibida | Dimensão renderizada |
|---|---|---|
| 390px | Mobile | 354 × 236px |
| 430px | Mobile | 394 × 262,66px |
| 768px | Desktop | 564 × 451,36px |
| 1024px | Desktop | 502,42 × 402,08px |
| 1366px | Desktop | 667,14 × 533,89px |

Todas as larguras: proporção preservada, sem rolagem horizontal, imagem decodificada, contêiner transparente e sem recorte. PNGs têm alpha zero nos quatro cantos. Sobre o fundo real não apareceu halo retangular; não houve limpeza ou redesenho dos pixels. Inspeção visual realizada nas cinco larguras e no detalhe da marca. No mobile, a arte fica abaixo do texto.

Seletor PT/EN verificado nas cinco larguras. Rótulos incorporados nas PNGs permanecem em português: versões de arte em inglês serão necessárias para traduzir esses rótulos.

Observação fora do escopo: em 1024px, o título existente quebra a palavra “Crescimento”. Essa tipografia não foi alterada. Rótulos secundários da ilustração são menores nessa largura; a captura permite avaliar seu tamanho antes de aprovar.

35 testes automatizados passaram. `git diff --check` sem erros. Teste de navegador reproduzível em `tests/verify-transparent-hero.js`.

## Capturas

- [390px](.playwright-cli/hero-transparent-390-hero.png)
- [430px](.playwright-cli/hero-transparent-430-hero.png)
- [768px](.playwright-cli/hero-transparent-768-hero.png)
- [1024px](.playwright-cli/hero-transparent-1024-hero.png)
- [1366px](.playwright-cli/hero-transparent-1366-hero.png)
- [Detalhe da marca](.playwright-cli/hero-transparent-brand.png)

Capturas adicionais PT e EN por largura estão em `.playwright-cli/hero-transparent-{largura}-{pt|en}.png`. Capturas locais não são publicadas no repositório.
