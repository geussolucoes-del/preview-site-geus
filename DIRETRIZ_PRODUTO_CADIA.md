# Diretriz-mestre — CADIA, operação inteligente de demanda da Geus

> Documento de implementação para o Astra/Codex. Nome comercial definido nesta diretriz: **CADIA — Camada Autônoma de Demanda e Inteligência Aplicada**.

> Atualização de autorização: no pedido de implementação, o usuário autorizou expressamente commit e envio ao repositório. Essa autorização substitui as restrições preliminares de publicação nas seções 1 e 12 abaixo; os demais critérios permanecem válidos.

## 1. Repositório e regra de trabalho

- Repositório oficial do site: `https://github.com/geussolucoes-del/preview-site-geus`
- Diretório local atual: `/workspace/scratch/4daf26c1c147/geus-site`
- Branch de referência: `main`
- O site é estático, construído em HTML, CSS e JavaScript.
- Antes de alterar qualquer arquivo, ler integralmente:
  - `README.md`
  - `index.html`
  - `produtos/index.html`
  - `produtos/autoflux/index.html`
  - `produtos/madg/index.html`
  - `diagnostico/index.html`
  - `assets/ecosystem.css`
  - `assets/ecosystem.js`
  - `sitemap.xml`
- Inspecionar também os ativos de marca existentes em `images/` e `assets/`.
- Não instalar framework ou reescrever o projeto.
- Não modificar identidade, logotipo, paleta ou arquitetura global do site.
- Não fazer commit, push ou publicação. O usuário validará a versão local antes de autorizar.
- Preservar alterações existentes que não façam parte desta tarefa.

## 2. Contexto estratégico da Geus

A Geus deve ser apresentada como uma operação de aquisição e conversão, nunca como simples agência de posts, tráfego, sites ou fornecimento isolado de leads.

Tese central da marca:

`Demanda → Infraestrutura → Conversão → Inteligência → Venda → Retenção`

Produtos existentes:

- **AutoFlux:** produto automotivo verticalizado que conecta estoque, presença digital, campanhas, WhatsApp, qualificação, dados e vendas.
- **MADG:** metodologia estratégica da Geus para aquisição, infraestrutura, conversão, inteligência, retenção e previsibilidade.
- **CADIA:** camada autônoma de demanda e inteligência aplicada que recebe a demanda e conduz cada oportunidade dentro do nível de autonomia autorizado pela empresa.

O novo produto deve funcionar de forma independente ou conectado ao MADG e ao AutoFlux.

## 3. Definição do novo produto

### Nome e assinatura

- Nome comercial: **CADIA**
- Significado: **Camada Autônoma de Demanda e Inteligência Aplicada**
- Slug: `/produtos/cadia/`
- Assinatura principal: **Demanda em movimento. Da primeira mensagem à próxima decisão.**
- Forma institucional: `Geus / CADIA`

O nome combina duas lógicas já existentes no portfólio: a força proprietária de AutoFlux e a construção metodológica em sigla do MADG. CADIA deve ser pronunciado como uma palavra, não soletrado letra por letra.

Não apresentar como “chatbot”, “robô de WhatsApp”, “respostas automáticas” ou “funcionário de IA”. Esses termos reduzem a proposta.

Definição aprovada:

> Uma operação inteligente de demanda que atende, qualifica, acompanha, agenda e pode concluir cada oportunidade, com o nível de autonomia definido pela empresa.

Ideia central:

> Gerar demanda é só o começo. O resultado depende do que acontece depois que o lead chama.

O sistema usa o OpenClaw como núcleo de orquestração, conectado ao modelo de IA e às ferramentas necessárias. OpenClaw é uma decisão técnica e não precisa ser a manchete comercial da página.

## 4. Modos de operação

Apresentar três níveis claramente diferentes.

### 4.1 Demanda Assistida

- Responde imediatamente.
- Interpreta mensagens, áudios e contexto.
- Identifica necessidade e intenção.
- Coleta os dados definidos pela empresa.
- Pré-qualifica o contato.
- Organiza e resume a conversa.
- Transfere a oportunidade ao atendente humano no momento certo.

Resultado: o atendente recebe contexto e prioridade, sem começar a conversa do zero.

### 4.2 Demanda Supervisionada

- Inclui tudo da modalidade Assistida.
- Qualifica com maior profundidade.
- Trabalha objeções dentro das regras aprovadas.
- Executa cadências de follow-up.
- Consulta agenda, disponibilidade, estoque ou condições.
- Agenda atendimento, visita, reunião ou serviço.
- Pode entregar proposta ou pré-fechamento.
- A confirmação final permanece com uma pessoa.

Resultado: a equipe recebe uma oportunidade agendada ou preparada para conferência e fechamento.

### 4.3 Demanda Autônoma

- Executa a jornada comercial completa permitida.
- Atende, qualifica, acompanha e negocia dentro de limites previamente definidos.
- Consulta dados e disponibilidade em tempo real.
- Agenda e confirma.
- Envia proposta, contrato, cobrança ou link de pagamento quando aplicável.
- Confirma o fechamento e atualiza CRM ou sistema operacional.
- Aciona uma pessoa somente diante de exceção, risco ou situação fora da política.
- Não exige acompanhamento humano diário.
- Recebe curadoria, auditoria e evolução periódicas.

Resultado: a operação funciona de forma autônoma dentro de um processo comercial previamente estruturado.

## 5. Princípio de autonomia responsável

A mensagem deve ser comercialmente forte sem prometer autonomia irrestrita.

Formulação correta:

> Autonomia completa dentro das regras, integrações e limites definidos pela empresa.

Regras possíveis:

- Limite máximo de desconto.
- Serviços ou produtos que podem ser oferecidos.
- Horários realmente disponíveis.
- Condições mínimas para confirmar um pedido ou agendamento.
- Confirmação de pagamento antes da conclusão.
- Situações que exigem transferência humana.
- Proteção de informações sensíveis.
- Registro e auditoria de todas as decisões importantes.

O papel humano na modalidade autônoma é de governança periódica, não de vigilância conversa por conversa.

## 6. Infraestrutura que pode ser conectada

- WhatsApp Business Platform por integração oficial.
- Modelo de inteligência artificial via API.
- CRM ou banco de dados.
- Google Calendar ou agenda equivalente.
- Estoque, catálogo ou sistema interno.
- Propostas e documentos.
- Assinatura eletrônica.
- Pagamentos e confirmação de cobrança.
- Painel, logs, métricas e relatórios.

Não afirmar que todas as integrações estão incluídas no preço inicial. A composição depende do diagnóstico.

## 7. Oferta e preço público

Não criar tabela pública com preço individual para cada modo.

Exibir apenas a âncora de implantação:

> **Implantação a partir de R$ 1.500**
>
> A operação continuada é dimensionada conforme o volume de atendimentos, as integrações e o nível de autonomia.

Diretrizes:

- Os R$ 1.500 representam o valor inicial de implantação, não uma compra vitalícia.
- Não destacar a palavra “mensalidade”.
- Deixar semanticamente claro que existe operação continuada e recorrente.
- Não prometer todas as integrações pelo preço inicial.
- O valor definitivo será apresentado após diagnóstico.

## 8. Direção de copy

### Promessa principal sugerida

> Da primeira mensagem ao fechamento — com o nível de autonomia que sua operação estiver preparada para receber.

### Linha de tensão sugerida

> Sua empresa não precisa apenas receber leads. Precisa saber conduzi-los.

### Transformação

`Lead recebido → contexto compreendido → qualificação → objeções → follow-up → agenda ou fechamento → inteligência registrada`

### Diferenciais que precisam aparecer

- Linguagem natural adaptada à empresa.
- Resposta imediata sem conversa engessada.
- Continuidade de contexto.
- Follow-up que não deixa a oportunidade esfriar.
- Integrações com a operação real.
- Autonomia configurável.
- Transferência humana com contexto.
- Curadoria e evolução periódicas.
- Dados que ajudam a entender objeções, gargalos e conversão.

### Evitar

- Promessas absolutas de vendas ou conversão.
- Estatísticas não comprovadas.
- Linguagem genérica de “IA revolucionária”.
- Excesso de termos técnicos.
- Apresentar OpenClaw como se ele, isoladamente, fosse todo o produto.
- Fazer parecer que o objetivo é demitir ou eliminar pessoas.

## 9. Arquitetura sugerida para a nova página

Criar uma página própria em `produtos/cadia/index.html`.

1. **Hero**
   - Marca `Geus / CADIA`.
   - Promessa centrada em operar a demanda após a entrada do lead.
   - CTA para entender o sistema.
   - CTA para diagnóstico.

2. **O vazamento após o clique**
   - Demora na resposta.
   - Qualificação inconsistente.
   - Falta de follow-up.
   - Agenda desorganizada.
   - Perda de contexto na passagem para o humano.

3. **O caminho da demanda**
   - Visualizar o fluxo completo do primeiro contato à próxima decisão.

4. **Três níveis de autonomia**
   - Assistida.
   - Supervisionada.
   - Autônoma.
   - A apresentação deve deixar a progressão óbvia sem transformar os níveis em planos fechados.

5. **Integrações operacionais**
   - Agenda, CRM, estoque, proposta, contrato e pagamento.

6. **Autonomia com regras**
   - Demonstrar limites, exceções, logs e governança.

7. **O que a empresa recebe**
   - Diagnóstico do processo.
   - Configuração da inteligência.
   - Integrações contratadas.
   - Treinamento e testes.
   - Entrada em operação.
   - Curadoria e evolução periódicas.

8. **Oferta**
   - Implantação a partir de R$ 1.500.
   - Operação continuada dimensionada após diagnóstico.

9. **CTA final**
   - Levar ao diagnóstico com o produto pré-selecionado.

## 10. Inserções necessárias no ecossistema do site

Implementar as seguintes integrações no ecossistema:

- Adicionar o terceiro card em `produtos/index.html`.
- Atualizar “01 / 02” para “01 / 03”.
- Atualizar título, descrição, Open Graph e textos PT/EN da página de produtos.
- Ajustar o grid de produtos para três cards com boa composição em desktop, tablet e mobile.
- Criar a página própria do novo produto.
- Incluir o produto no formulário de `diagnostico/index.html` e na leitura de query string de `assets/ecosystem.js`.
- Atualizar links pertinentes do footer sem retirar AutoFlux ou MADG.
- Atualizar `sitemap.xml`.
- Manter URLs sem acentos: usar `/diagnostico/`.
- Manter suporte bilíngue com `data-pt` e `data-en`, seguindo o padrão existente.

## 11. Direção visual

- Usar o sistema visual já existente no repositório como fonte de verdade.
- Preservar a marca Geus, composição grafite/violeta, tipografia e acabamento editorial profissional.
- Utilizar a logo oficial existente sem fundo; não reinterpretar o símbolo.
- Criar personalidade visual própria para o produto sem desconectá-lo da marca principal.
- Evitar estética clichê de chatbot: robôs, cérebros luminosos, circuitos genéricos e balões infantis.
- Priorizar a visualização do movimento da demanda, níveis de autonomia, continuidade e passagem de contexto.
- Uma simulação de conversa pode aparecer como prova visual, desde que seja sofisticada, curta e semanticamente útil.
- Reutilizar componentes e padrões existentes antes de criar novas classes.
- Garantir acessibilidade, foco visível, contraste e suporte a `prefers-reduced-motion`.

## 12. Critérios de aceite

- A página parece parte nativa do site Geus.
- O produto não é confundido com chatbot simples.
- Os três níveis de autonomia são compreendidos rapidamente.
- A modalidade autônoma deixa claro que não exige acompanhamento humano diário.
- A governança periódica e o tratamento de exceções permanecem explícitos.
- O preço é entendido como implantação inicial.
- A recorrência existe semanticamente, sem preço público fechado.
- Nenhuma promessa ou estatística foi inventada.
- Todos os textos existem em português e inglês.
- Desktop e mobile foram verificados visualmente.
- Nenhum commit, push ou deploy foi realizado antes da validação do usuário.

## 13. Decisões consolidadas e pendências visuais

Decisões consolidadas:

1. Nome comercial: CADIA.
2. Expansão do nome: Camada Autônoma de Demanda e Inteligência Aplicada.
3. Slug: `/produtos/cadia/`.
4. Assinatura: “Demanda em movimento. Da primeira mensagem à próxima decisão.”

Pendente durante a implementação visual:

1. O Astra/Codex deve avaliar, a partir da linguagem visual existente, se o hero funciona melhor com imagem exclusiva ou composição gráfica em HTML/CSS.
2. A decisão deve privilegiar coerência com o ecossistema Geus, desempenho mobile e ausência de clichês visuais de chatbot.
