# Ativar a entrega de diagnósticos

O mesmo formulário em `assets/diagnostic.js` atende home e `/diagnostico/`.
Ele já adapta as perguntas para AutoFlux, MADG (ADG), CADIA ou projeto geral.
`assets/lead-service.js` envia todos ao mesmo serviço e template EmailJS, incluindo
produto, nome, empresa, telefone, e-mail, respostas, plano quando aplicável, URL e consentimento.
Produto, plano e modo são preservados dos CTAs. Trocar de produto limpa as perguntas da opção anterior.
Na homepage o visitante escolhe a solução. Nos diagnósticos com `?produto=autoflux`,
`?produto=madg` ou `?produto=cadia`, a solução fica fixa e não aparece um seletor.
O mesmo controlador, serviço e template enviam todos os contatos.
O acesso a `/diagnostico/` sem um produto válido leva ao formulário da homepage,
onde a escolha fica disponível. Editar respostas não libera a troca no diagnóstico de produto.

## Configuração na conta

1. Conecte seu serviço de envio no EmailJS.
2. Reutilize ou crie **um** template e cole `template-unico.html` no editor HTML.
3. Configure To Email fixo: `geussolucoes@gmail.com`.
4. Subject: `[GEUS · {{product}}] Novo diagnóstico de {{name}}`.
5. From Name: `GEUS Site`. Remetente: o endereço do serviço conectado.
6. Deixe Reply-To vazio/fixo: o e-mail do visitante é opcional.
7. Copie Public Key, Service ID e Template ID para `assets/lead-config.js`.
   Não use chave privada, senha ou token de acesso neste arquivo público.
8. Se sua conta restringir domínios, autorize os domínios de produção usados pelo site.
9. Envie um diagnóstico real, confirme o histórico EmailJS e o recebimento na caixa de entrada.

As respostas são renderizadas em linhas individuais pelo loop `{{#answer_rows}}`,
usando `{{question}}` e `{{answer}}`. O EmailJS suporta listas de objetos nos templates.
O bloco `{{^answer_rows}}` mantém compatibilidade com o texto `{{answers}}` da versão anterior.
As variáveis usam chaves duplas: o EmailJS escapa respostas do usuário.
Não use chaves triplas para essas respostas.

O HTML foi inspirado na organização dos exemplos BrasilCleaning e Ana Lemes:
cabeçalho da marca, destaque do produto, contato, respostas e registro do envio.
Usa tabelas, estilos inline, largura fluida até 600 px, ajuste mobile e largura
condicional para Outlook. A logo é uma imagem remota; mesmo com imagens bloqueadas,
o nome GEUS e todos os dados continuam em texto. Respostas opcionais ausentes não
viram links de e-mail inválidos. O status é “A avaliar” até análise humana.

Cole o arquivo **completo** no editor HTML do EmailJS (não no editor visual).
O preview local confere layout e variáveis; a entrega/renderização no Gmail ou
Outlook só pode ser confirmada pelo envio real depois de configurar a conta.

Sem configuração, em erro HTTP ou timeout, o formulário mantém as respostas e mostra
uma mensagem com opção de nova tentativa. Somente depois do aceite do EmailJS
o visitante vai para `/obrigado/`, onde pode continuar no WhatsApp com o contexto.
O aceite da API não prova entrega na caixa de entrada; confira o primeiro envio real.
Não existe fila permanente de contatos ou reenvio automático no navegador.

## Eventos sem dados pessoais

- `diagnostic_form_open_click`: clique de entrada no diagnóstico.
- `diagnostic_form_midpoint`: avanço à segunda etapa, uma vez por formulário.
- `diagnostic_form_submit_attempt`: tentativa de envio.
- `diagnostic_form_submit`: envio aceito pelo EmailJS (conversão).
- `diagnostic_form_error`: falha; inclui um código, sem as respostas.
- `diagnostic_thank_you_view`: visita à página com recibo de envio na sessão.
- `diagnostic_thank_you_whatsapp_click`: clique WhatsApp após envio.
- `diagnostic_whatsapp_open`: nome anterior, preservado no clique da página de obrigado.

Cada evento inclui `product` e `funnel`. Não configure a tentativa como conversão no Google Ads.
O diagnóstico atual qualifica por leitura humana: no e-mail aparece “A avaliar”,
sem afirmar que qualquer preenchimento seja um lead automaticamente qualificado.

Fontes oficiais: https://www.emailjs.com/docs/rest-api/send/
e https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/
