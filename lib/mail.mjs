import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Ported from TUREIS main 5797ac1 (mail fixes through 336aec7).
const MAIL_ADDRESS = 'contato@flatfreebrasil.com.br';
const MAIL_FROM = `Flat Free Brasil <${MAIL_ADDRESS}>`;
const validId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function safeEqual(a, b) {
  return typeof a === 'string' && typeof b === 'string' &&
    Buffer.byteLength(a) === Buffer.byteLength(b) &&
    timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function cookie(req, name) {
  return req.headers.cookie?.split(';').map(c => c.trim()).find(c => c.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}
function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}
async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32_768) throw new Error('size');
    chunks.push(chunk);
  }
  const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('format');
  return value;
}
function normalizeAddress(value) {
  return String(value || '').replace(/^.*<([^<>]+)>.*$/, '$1').trim().toLowerCase();
}
function addressedTo(message, address) {
  return Array.isArray(message.to) && message.to.some(value => normalizeAddress(value) === address);
}
function plainFromHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function validEmail(value) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}
function parseRecipients(value) {
  const values = String(value || '').split(',').map(v => v.trim()).filter(Boolean);
  if (!values.length || values.length > 10 || values.some(v => !validEmail(v))) return null;
  return values;
}
function config() {
  return {
    address: MAIL_ADDRESS,
    from: MAIL_FROM,
    password: process.env.MAIL_ADMIN_PASSWORD || '',
    sessionSecret: process.env.MAIL_SESSION_SECRET || '',
    apiKey: process.env.RESEND_MAIL_API_KEY?.trim() || ''
  };
}
function sessionSignature(issued, secret) {
  return createHmac('sha256', secret).update(`mail:${issued}`).digest('base64url');
}
function authenticated(req) {
  const cfg = config();
  if (cfg.sessionSecret.length < 32) return false;
  const parts = cookie(req, 'flat_free_mail').split('.');
  if (parts.length !== 2 || !/^\d{13}$/.test(parts[0])) return false;
  const [issued, signature] = parts;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age <= 12 * 60 * 60 * 1000 &&
    safeEqual(signature, sessionSignature(issued, cfg.sessionSecret));
}
function setSession(res, origin) {
  const cfg = config();
  const issued = String(Date.now());
  const signature = sessionSignature(issued, cfg.sessionSecret);
  res.setHeader('Set-Cookie', `flat_free_mail=${issued}.${signature}; HttpOnly; SameSite=Strict; Path=/api/mail; Max-Age=43200${origin.startsWith('https:') ? '; Secure' : ''}`);
}
function clearSession(res, origin) {
  res.setHeader('Set-Cookie', `flat_free_mail=; HttpOnly; SameSite=Strict; Path=/api/mail; Max-Age=0${origin.startsWith('https:') ? '; Secure' : ''}`);
}
function configured() {
  const cfg = config();
  return Boolean(cfg.address && cfg.from && cfg.password && cfg.sessionSecret.length >= 32 && cfg.apiKey);
}
async function resend(path, options = {}) {
  const cfg = config();
  if (!cfg.apiKey) throw new Error('mail-config');
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    signal: AbortSignal.timeout(12_000),
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('resend');
  return body;
}

export function createMailHandler({ origin }) {
  // Only Vercel Preview uses its exact deployment URL; never trust request host headers
  // or branch aliases. Missing/invalid VERCEL_URL fails closed; Production keeps APP_ORIGIN.
  const vercelPreview = process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'preview';
  const deploymentHost = process.env.VERCEL_URL || '';
  const postOrigin = vercelPreview
    ? (/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/i.test(deploymentHost) ? `https://${deploymentHost}` : '')
    : origin;
  const attempts = new Map();
  function limited(key, max, windowMs) {
    const now = Date.now();
    for (const [key, row] of attempts) if (row.until < now) attempts.delete(key);
    if (!attempts.has(key) && attempts.size >= 10000) return true;
    let row = attempts.get(key);
    if (!row || row.until < now) row = { count: 0, until: now + windowMs };
    row.count += 1;
    attempts.set(key, row);
    return row.count > max;
  }

  return async function mailHandler(req, res, path, url) {
    try {
      const methods = { status: 'GET', inbox: 'GET', sent: 'GET', message: 'GET', login: 'POST', logout: 'POST', send: 'POST' };
      const action = path.slice('/api/mail/'.length);
      if (!Object.hasOwn(methods, action)) return json(res, 404, { error: 'Rota não encontrada.' });
      if (req.method !== methods[action]) return json(res, 405, { error: 'Método não permitido.' });
      if (req.method === 'POST') {
        if (!postOrigin || req.headers.origin !== postOrigin) {
          return json(res, 403, { error: 'Origem não permitida.' });
        }
        const mediaType = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
        if (mediaType !== 'application/json') {
          return json(res, 415, { error: 'Formato de mensagem inválido.' });
        }
      }
      if (path === '/api/mail/status' && req.method === 'GET') {
        return json(res, 200, { configured: configured(), authenticated: authenticated(req) });
      }
      if (path === '/api/mail/login' && req.method === 'POST') {
        if (!configured()) return json(res, 503, { error: 'A caixa privada ainda não está configurada.' });
        if (limited(`login:${req.socket.remoteAddress}`, 8, 15 * 60_000)) {
          return json(res, 429, { error: 'Muitas tentativas. Aguarde alguns minutos.' });
        }
        let body;
        try { body = await readJson(req); } catch { return json(res, 400, { error: 'Não foi possível ler os dados.' }); }
        const cfg = config();
        if (!safeEqual(body?.password, cfg.password)) return json(res, 401, { error: 'Senha incorreta.' });
        setSession(res, postOrigin);
        return json(res, 200, { ok: true });
      }
      if (path === '/api/mail/logout' && req.method === 'POST') {
        clearSession(res, postOrigin);
        return json(res, 200, { ok: true });
      }
      if (!authenticated(req)) return json(res, 401, { error: 'Sessão expirada. Entre novamente.' });

      const cfg = config();

      if (path === '/api/mail/inbox' && req.method === 'GET') {
        const data = await resend('/emails/receiving?limit=100');
        const rows = Array.isArray(data.data) ? data.data : [];
        return json(res, 200, {
          data: rows.filter(row => addressedTo(row, cfg.address))
        });
      }

      if (path === '/api/mail/sent' && req.method === 'GET') {
        const data = await resend('/emails?limit=100');
        const rows = Array.isArray(data.data) ? data.data : [];
        return json(res, 200, {
          data: rows.filter(row => normalizeAddress(row.from) === cfg.address)
        });
      }

      if (path === '/api/mail/message' && req.method === 'GET') {
        const id = url.searchParams.get('id') || '';
        const kind = url.searchParams.get('kind');
        if (!validId(id) || !['received', 'sent'].includes(kind)) {
          return json(res, 400, { error: 'Mensagem inválida.' });
        }
        const data = await resend(kind === 'received' ? `/emails/receiving/${id}` : `/emails/${id}`);
        if ((kind === 'received' && !addressedTo(data, cfg.address)) ||
            (kind === 'sent' && normalizeAddress(data.from) !== cfg.address)) {
          return json(res, 404, { error: 'Mensagem não encontrada.' });
        }
        return json(res, 200, {
          id: data.id,
          kind,
          from: data.from,
          to: data.to || [],
          cc: data.cc || [],
          bcc: data.bcc || [],
          reply_to: data.reply_to || [],
          subject: data.subject || '(sem assunto)',
          created_at: data.created_at || data.received_at || '',
          message_id: data.message_id || '',
          text: String(data.text || '').trim() || plainFromHtml(data.html)
        });
      }

      if (path === '/api/mail/send' && req.method === 'POST') {
        if (limited(`send:${req.socket.remoteAddress}`, 30, 60 * 60_000)) {
          return json(res, 429, { error: 'Limite de envios atingido. Aguarde antes de continuar.' });
        }
        let body;
        try { body = await readJson(req); } catch { return json(res, 400, { error: 'Não foi possível ler a mensagem.' }); }

        if (['to', 'subject', 'message'].some(key => typeof body[key] !== 'string') ||
            ['cc', 'bcc', 'replyId'].some(key => body[key] !== undefined && typeof body[key] !== 'string')) {
          return json(res, 422, { error: 'Formato de mensagem inválido.' });
        }

        const to = parseRecipients(body?.to);
        const cc = body?.cc ? parseRecipients(body.cc) : [];
        const bcc = body?.bcc ? parseRecipients(body.bcc) : [];
        const subject = String(body?.subject || '').trim();
        const message = String(body?.message || '').trim();

        if (!to || cc === null || bcc === null || !subject || subject.length > 200 || !message || message.length > 20_000) {
          return json(res, 422, { error: 'Confira destinatários, assunto e mensagem.' });
        }

        const payload = { from: cfg.from, to, subject, text: message };
        if (cc.length) payload.cc = cc;
        if (bcc.length) payload.bcc = bcc;

        if (body?.replyId) {
          const replyId = String(body.replyId);
          if (!validId(replyId)) return json(res, 422, { error: 'Referência de resposta inválida.' });
          const original = await resend(`/emails/receiving/${replyId}`);
          if (!addressedTo(original, cfg.address)) {
            return json(res, 404, { error: 'Mensagem não encontrada.' });
          }
          if (original.message_id) payload.headers = {
            'In-Reply-To': original.message_id,
            'References': original.message_id
          };
        }

        const result = await resend('/emails', {
          method: 'POST',
          headers: { 'Idempotency-Key': `flat-free-mail-${randomBytes(16).toString('hex')}` },
          body: JSON.stringify(payload)
        });
        if (!result?.id) throw new Error('delivery');
        return json(res, 200, { ok: true, id: result.id });
      }

      return json(res, 404, { error: 'Rota não encontrada.' });
    } catch {
      return json(res, 502, { error: 'Não foi possível concluir a operação de e-mail agora.' });
    }
  };
}
