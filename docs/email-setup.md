# E-mail Flat Free Brasil — configuração preparada em 03/10/2026

## Auditoria
- Main auditada: fe040613c089877cd65daed9671d7e9b7d906de2.
- Formulário existente: /solicitar -> /api/solicitar -> FormSubmit, destino padrão Gmail.
- DNS consultado inicialmente em a.auto.dns.br / b.auto.dns.br.
- Resend configurado em sa-east-1 com envio e recebimento habilitados.
- Domínio flatfreebrasil.com.br verificado pelo Resend em 04/10/2026.
- Inbox TUREIS existente confirma disponibilidade da funcionalidade de recebimento na conta.
- A integração do formulário foi preparada sem alterar a produção até a validação ponta a ponta.

## Registros DNS do Resend
Registros adicionados no Registro.br, preservando os registros do site:

| Tipo | Nome relativo | Valor | Prioridade |
|---|---|---|---|
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIbDQEBAQUAA4GNADCBiQKBgQDdc0i5Bh2LpxGTVcowIkmP06vGWt8qkcbIuC8ftPUOoMUklMzNfw6DcJJjhGWoonYu3mDtzXeR6x7mHAuJia/gAqKNet/b2d1Wt50p2bnWvmra1oggAxPAB7n/YvLWR14o+l7/NxhU6mj9w0A9pH0Y+4pNHJY4hwix9nN/F9YZKwIDAQAB | — |
| MX | send | feedback-smtp.sa-east-1.amazonses.com | 10 |
| TXT | send | v=spf1 include:amazonses.com ~all | — |
| CNAME | rsend | send.forge.rmta.net | — |
| MX | raiz (nome vazio) | inbound-smtp.sa-east-1.amazonaws.com | 0 |

Estado confirmado em 04/10/2026:
- DKIM: verificado.
- SPF/CNAME de envio: verificado.
- MX de recebimento: verificado.
- Status geral do domínio no Resend: Verified.
- Envio e recebimento: habilitados.

## Formulário preparado nesta branch
Substitui FormSubmit pelo envio direto ao Resend. Mantém os dados do atendimento e honeypot; valida e-mail, usa texto simples e Reply-To do visitante, limita tempo de espera e retorna erro se faltar chave.

Variáveis privadas de servidor configuradas na Vercel para Preview e Production:
- RESEND_API_KEY: chave de envio restrita ao domínio Flat Free Brasil, armazenada como segredo.
- CONTACT_FROM_EMAIL: Flat Free Brasil <contato@flatfreebrasil.com.br>
- CONTACT_TO_EMAIL: contato@flatfreebrasil.com.br

Nunca usar NEXT_PUBLIC_ para a chave. O segredo não deve ser registrado neste arquivo ou no repositório.

## Recebimento e resposta
O domínio já está apto a receber mensagens via Resend. O endereço operacional previsto é contato@flatfreebrasil.com.br.
Usar inicialmente o painel de recebimento do Resend para ler e responder, sem necessidade de construir webmail próprio nesta etapa.

## Validação
Teste isolado com provedor simulado passou: honeypot, e-mail inválido, destino, Reply-To, resposta do provedor, chave ausente e JSON inválido.
Build local compilou, validou tipos e gerou 27 páginas, com exit 0. Houve aviso de cópia standalone por limitação de symlink no Windows ao reutilizar dependências locais.

## Estado atual em 04/10/2026
- Registros DNS salvos no Registro.br.
- Domínio flatfreebrasil.com.br: Verified no Resend.
- Envio: habilitado.
- Recebimento: habilitado.
- Chave restrita de envio: criada.
- Variáveis RESEND_API_KEY, CONTACT_FROM_EMAIL e CONTACT_TO_EMAIL: configuradas na Vercel para Preview e Production.
- Branch de integração: feat/contact-resend.
- Produção: ainda não promovida nesta etapa.

Próximos passos:
1. Gerar um novo Preview da branch já com as variáveis atuais.
2. Testar envio real pelo formulário.
3. Confirmar recebimento no Resend e Reply-To correto.
4. Testar resposta para um endereço externo.
5. Somente depois promover a integração para produção.
