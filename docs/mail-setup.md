# Flat Free private webmail — Preview only

Base: `4e80302797b03f6af03eec1bea43dd9e056672ff`. Branch: `feat/secure-mail`.

## Audited TUREIS source

Cloned `vicgouveia-cloud/tureis` and compared `main` at
`5797ac1276c71510e3295791197c0df87516ea7f` with `fix/mail-preview-origin`.
There is no difference in `mail.mjs` or `public/mail.js` between those tips.
The final mail fixes are `240efbe` (dedicated key), `61a54ab` (POST origin,
JSON content type, received-message and reply ownership), and `336aec7`
(exact Vercel Preview deployment origin). Earlier intermediate versions were not used.

The final TUREIS implementation still lacked a sender ownership check on direct
sent-message reads. Flat Free adds that check, strict UUID validation, strict JSON
object/string fields, exact cookie parsing, and a fixed mailbox independent of env overrides.
Its compose cancel buttons now bypass required-field validation, so an empty draft
can close normally. Logout and session expiration clear the displayed messages and draft.

## Operation and configuration

- `/mail` serves the reused standalone interface, adapted to Flat Free.
- `/mail/` follows an explicit canonical redirect to `/mail`; both carry `X-Robots-Tag`.
  Mail-only middleware owns that redirect and headers because Next.js 15 discards
  configured headers on redirects. The automatic early slash redirect is replaced by
  an explicit 308 rule for public paths, preserving their existing canonical destinations.
- HTML contains `noindex, nofollow, noarchive`; robots.txt excludes mail paths.
- Private API: `/api/mail/{status,login,logout,inbox,sent,message,send}`.
- Only `contato@flatfreebrasil.com.br` is available. Received IDs and reply IDs require
  that address in `to`; sent IDs require that sender. Unauthorized reads return 404.
- Read bodies render as text; HTML, scripts, tracking images, and attachments are not rendered.
- Replies prefer the message's Reply-To and preserve Message-ID threading.
- The cookie is signed with HMAC-SHA256, HttpOnly, SameSite=Strict, Secure on HTTPS,
  scoped to `/api/mail`, and expires after 12 hours. Logout clears it and the UI state.
- All mutations, including login/logout, require exact Origin and application/json.
  Preview accepts only `https://${VERCEL_URL}`; branch aliases and request Host are not trusted.
- JSON bodies are capped at 32 KiB. API responses and HTML use no-store.
- CSP prevents external scripts/frames and rendering embedded email HTML.

The webmail uses `RESEND_MAIL_API_KEY` exclusively, never the public form's
`RESEND_API_KEY`. Resend reading/listing requires Full access; that key is account-wide
at the provider, so mailbox isolation is enforced by the server on every list/read/reply.
The key must remain server-only. It is stored as a sensitive Vercel variable scoped
only to this branch's Preview, together with `MAIL_ADMIN_PASSWORD` and
`MAIL_SESSION_SECRET`. No Production variables were added or changed.

The generated Preview login password/session secret are also in the ignored local
`.env.mail.local` for the operator and verification. The API key is not in that file,
in source, in client bundles, or in the report. Provision separate production secrets
only as part of a later authorized promotion. Do not merge yet.

## Validation

Run `npm run test:mail` and `npm run build`. The tests exercise unauthenticated access,
login/logout cookies, tampered/expired/future/malformed sessions, missing private config,
CSRF and exact Preview origin, content types and invalid/oversized bodies, rate limits,
filtered inbox/sent lists, own and foreign received/sent IDs, plain-text display,
send/recipient validation, own and foreign reply IDs, provider failures, and byte equality
of the public form and API against the base commit. Provider calls in that suite are mocked.

HTTP checks and live Resend checks are recorded in `docs/mail-validation.md` after Preview deployment.
For repeatable local HTTP checks, after the build run `npm run test:mail:server` in one
terminal and `npm run test:mail:http` in another. This fixture uses fake keys and provider
responses, does not send email, and refuses to run on Vercel. It is never imported by application code.

## Operational limits

Same basic rate limiting as TUREIS: counters are per warm process, not durable across
Vercel instances or restarts. A shared password authenticates one administrative mailbox;
there is no multi-user audit log or password recovery flow. Lists show the latest 100
account messages filtered to the mailbox, so older mailbox items can fall outside the window.
Attachments are not supported. These are explicit limits of the reused initial webmail.

Public `/solicitar`, its components, and `/api/solicitar` must remain identical to the base.
