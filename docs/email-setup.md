# E-mail Flat Free Brasil — configuração preparada em 03/10/2026

## Auditoria
- Main auditada: fe040613c089877cd65daed9671d7e9b7d906de2.
- Formulário existente: /solicitar -> /api/solicitar -> FormSubmit, destino padrão Gmail.
- DNS consultado: a.auto.dns.br / b.auto.dns.br; MX nulo na raiz; TXT raiz v=spf1 -all.
- Resend não tinha este domínio. Cadastrado em sa-east-1, com envio e recebimento habilitados, ainda não verificados.
- Inbox TUREIS existente confirma disponibilidade dessa funcionalidade na conta. Inbox Flat Free aguarda verificação de recebimento.
- Conector Vercel retornou apenas pet_searchers; não foi possível auditar as variáveis da hospedagem Flat Free por ele.
- Acesso HTTPS ao domínio falhou na resolução. Não há validação ponta a ponta em produção.

## Registros DNS fornecidos pelo Resend
Adicionar no Registro.br, preservando os registros do site:

| Tipo | Nome relativo | Valor | Prioridade |
|---|---|---|---|
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdc0i5Bh2LpxGTVcowIkmP06vGWt8qkcbIuC8ftPUOoMUklMzNfw6DcJJjhGWoonYu3mDtzXeR6x7mHAuJia/gAqKNet/b2d1Wt50p2bnWvmra1oggAxPAB7n/YvLWR14o+l7/NxhU6mj9w0A9pH0Y+4pNHJY4hwix9nN/F9YZKwIDAQAB | — |
| MX | send | feedback-smtp.sa-east-1.amazonses.com | 10 |
| TXT | send | v=spf1 include:amazonses.com ~all | — |
| CNAME | rsend | send.forge.rmta.net | — |
| MX | raiz (nome vazio) | inbound-smtp.sa-east-1.amazonaws.com | 0 |

O MX nulo atual deve ser substituído pelo MX de recebimento. Não manter ambos.
TTL: automático. O SPF de envio é no subdomínio send; não adicionar um segundo SPF na raiz.
Após salvar: disparar verificação no Resend e conferir envio e recebimento como verificados.

## Formulário preparado nesta branch
Substitui FormSubmit pelo envio direto ao Resend. Mantém os dados do atendimento e honeypot; valida e-mail, usa texto simples e Reply-To do visitante, limita tempo de espera e retorna erro se faltar chave.

Variáveis privadas de servidor na hospedagem:
- RESEND_API_KEY: chave de envio restrita a este domínio, criada e armazenada apenas no gerenciador de segredos.
- CONTACT_FROM_EMAIL: Flat Free Brasil <contato@flatfreebrasil.com.br>
- CONTACT_TO_EMAIL: contato@flatfreebrasil.com.br

Nunca usar NEXT_PUBLIC_ para a chave. Nenhuma chave criada ou exposta nesta etapa.
Não publicar esta integração sem domínio verificado e variáveis configuradas.

## Recebimento e resposta
Criar inbox contato@flatfreebrasil.com.br, nome Flat Free Brasil Contato, após verificação do MX.
Usar o painel de Inboxes do Resend para ler e responder inicialmente, como no TUREIS. Não é necessário construir webmail próprio nesta etapa.

## Validação
Teste isolado com provedor simulado passou: honeypot, e-mail inválido, destino, Reply-To, resposta do provedor, chave ausente e JSON inválido. Nenhum e-mail real enviado.
Pendente: compilação completa, Preview, envio real pelo formulário, confirmação da mensagem na inbox e teste externo de envio/resposta.
