# Webmail validation — 04/10/2026

Branch: `feat/secure-mail`. Base: `4e80302797b03f6af03eec1bea43dd9e056672ff`.
No merge or production promotion was performed.

## Passed

- `npm run build`: exit 0; compilation, type validation, page generation and tracing completed.
- `npm run test:mail`: 14 tests passed, 0 failures. Authentication, cookie security,
  tampered/expired/future/malformed sessions, missing credentials, CSRF/exact Preview origin,
  content types, invalid/oversized JSON, login rate limiting, mailbox filtering,
  own/foreign individual received and sent IDs, send validation, own/foreign replyId,
  threading headers, provider failure handling, plain-text rendering, noindex and baseline equality.
- `npm run test:mail:http`: 27 checks passed against the actual built Next.js server.
  Covered `/mail`, `/mail/` and headers; unchanged public canonical redirects; login,
  signed sessions, tampering/expiry, CSRF, content type; inbox/sent filtering;
  own/foreign received/sent reads; send and reply; public page and public API using
  a separate credential; logout. The Resend provider was simulated with fake keys.
- Browser verification: login, filtered inbox, message reader displaying script markup
  as text, reply composition, canceling an empty draft, logout and UI cleanup.
  No browser error/warning console entries were found.
- `/solicitar`, `/api/solicitar`, their components and supporting public code were not edited.
  Git comparison against the base and direct byte comparison of page/API passed.
- No mail credentials or key variable references were found in `.next/static`.
- Private variables are sensitive, scoped only to `feat/secure-mail` Preview.
  Existing public form variables and Production variables were preserved.

## Preview verification and pending live checks

The implementation was pushed to the dedicated branch and Vercel generated a READY Preview.
Use the exact deployment hostname from the delivery report for POST requests; branch aliases
are intentionally not accepted as mutation origins.

The remote application remains behind Vercel Authentication. Direct HTTP access redirects
to Vercel login, and the connector's authenticated fetch fails with 403 at
`read_protection_bypass`. The user was asked to refresh the Vercel connection and the retry
still failed. No project authentication protection or production setting was disabled.

Therefore live Preview login/inbox/read/send/reply and a real Preview public-form submission
remain pending. No live webmail email was sent during these tests. Local provider simulations
must not be mistaken for a confirmed live Resend flow.

The generated Preview operator password is `MAIL_ADMIN_PASSWORD` in ignored `.env.mail.local`.
That local file also holds the session secret; it contains no provider API key and is not committed.
Production credentials, a durable rate limiter, pagination beyond the latest 100 account
messages, attachments and multi-user administration are outside this Preview delivery.
