import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createMailHandler } from '../lib/mail.mjs';

const origin = 'https://flatfreebrasil.com.br';
const address = 'contato@flatfreebrasil.com.br';
const ownId = '00000000-0000-4000-8000-000000000001';
const foreignId = '00000000-0000-4000-8000-000000000002';
const secret = 'test-session-secret-at-least-32-characters';
const originalFetch = globalThis.fetch;
let handler, calls, provider;
function session(issued = Date.now()) {
  return `flat_free_mail=${issued}.${createHmac('sha256', secret).update(`mail:${issued}`).digest('base64url')}`;
}
async function request(action, options = {}) {
  const { method = ['login', 'logout', 'send'].includes(action) ? 'POST' : 'GET',
    body = {}, cookie, contentType = 'application/json', requestOrigin = origin, query = '' } = options;
  const req = Readable.from([Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]);
  req.method = method;
  req.headers = { ...(requestOrigin === null ? {} : { origin: requestOrigin }), 'content-type': contentType, ...(cookie ? {cookie} : {}) };
  req.socket = { remoteAddress: 'test' };
  const headers = {};
  const res = { setHeader(k,v) {headers[k] = v}, writeHead(status, values) {res.status = status; Object.assign(headers, values)}, end(body) {res.body = JSON.parse(body)} };
  const url = new URL(`/api/mail/${action}${query}`, origin);
  await handler(req, res, url.pathname, url);
  return { status: res.status, body: res.body, headers };
}
beforeEach(() => {
  Object.assign(process.env, { MAIL_ADMIN_PASSWORD: 'test-admin-password', MAIL_SESSION_SECRET: secret, RESEND_MAIL_API_KEY: 'test-private-key', RESEND_API_KEY: 'test-form-key' });
  delete process.env.VERCEL; delete process.env.VERCEL_ENV; delete process.env.VERCEL_URL;
  handler = createMailHandler({ origin });
  calls = [];
  provider = () => ({id: ownId});
  globalThis.fetch = async (url, options) => {
    calls.push({url: String(url), ...options});
    return new Response(JSON.stringify(provider(String(url), options)), {status: 200});
  };
});
after(() => {globalThis.fetch = originalFetch});

test('unauthenticated private routes reject without contacting provider', async () => {
  for (const action of ['inbox','sent','message','send']) assert.equal((await request(action)).status, 401);
  assert.equal(calls.length, 0);
});
test('login validates password, signs secure HttpOnly scoped cookie; logout expires it', async () => {
  assert.equal((await request('login', {body: {password: 'wrong'}})).status, 401);
  const login = await request('login', {body: {password: process.env.MAIL_ADMIN_PASSWORD}});
  assert.equal(login.status, 200);
  const cookie = login.headers['Set-Cookie'];
  for (const value of ['HttpOnly','SameSite=Strict','Secure','Path=/api/mail','Max-Age=43200']) assert.ok(cookie.includes(value));
  assert.equal((await request('status', {cookie})).body.authenticated, true);
  assert.match((await request('logout')).headers['Set-Cookie'], /Max-Age=0/);
});
test('session rejects tampering, expiration, future timestamps and extra components', async () => {
  for (const cookie of [session()+'.extra', session(Date.now()-43200001), session(Date.now()+60000), session().replace(/.$/,'!'), 'flat_free_mail=NaN.fake']) {
    assert.equal((await request('status',{cookie})).body.authenticated, false);
    assert.equal((await request('inbox',{cookie})).status,401);
  }
});
test('missing private config fails closed; public form key is never a fallback', async () => {
  delete process.env.RESEND_MAIL_API_KEY;
  assert.equal((await request('status')).body.configured,false);
  assert.equal((await request('login', {body:{password:'test-admin-password'}})).status,503);
  process.env.RESEND_MAIL_API_KEY = 'test-private-key'; process.env.MAIL_SESSION_SECRET = 'short';
  assert.equal((await request('inbox',{cookie:session()})).status,401);
});
test('every mutation requires exact origin including login and logout', async () => {
  for (const action of ['login','logout','send']) for (const requestOrigin of [null,'null','https://evil.example','https://www.flatfreebrasil.com.br','https://flatfreebrasil.com.br.evil.example']) {
    assert.equal((await request(action,{cookie:session(),requestOrigin})).status,403);
  }
  assert.equal(calls.length,0);
});
test('Preview trusts only exact deployment origin, not host/alias; malformed deployment fails closed', async () => {
  Object.assign(process.env,{VERCEL:'1',VERCEL_ENV:'preview',VERCEL_URL:'flat-free-brasil-unique.vercel.app'});
  handler = createMailHandler({origin});
  assert.equal((await request('logout',{requestOrigin:origin})).status,403);
  assert.equal((await request('logout',{requestOrigin:'https://flat-free-brasil-git-feat-secure-mail.vercel.app'})).status,403);
  assert.equal((await request('logout',{requestOrigin:'https://flat-free-brasil-unique.vercel.app'})).status,200);
  for (const host of ['', 'evil.example','https://valid.vercel.app','valid.vercel.app.evil.example']) {
    process.env.VERCEL_URL=host; handler=createMailHandler({origin});
    assert.equal((await request('logout',{requestOrigin:'https://'+host})).status,403);
  }
});
test('rejects inappropriate content types, malformed JSON, non-object JSON and oversized bodies', async () => {
  for (const contentType of ['text/plain','application/x-www-form-urlencoded','multipart/form-data','application/jsonp','']) assert.equal((await request('login',{contentType})).status,415);
  for (const body of ['{','null','[]','1', '"password"', JSON.stringify({password:'x'.repeat(33000)})]) assert.equal((await request('login',{body})).status,400);
  assert.equal((await request('logout',{contentType:'Application/JSON; charset=utf-8'})).status,200);
  assert.equal((await request('login',{method:'GET'})).status,405);
});
test('inbox and sent lists contain only the fixed mailbox despite env overrides', async () => {
  process.env.MAIL_ADDRESS='other@example.com'; process.env.MAIL_FROM_EMAIL='other@example.com';
  provider = url => ({data: url.includes('/receiving') ? [{id:ownId,to:[`Flat Free <${address.toUpperCase()}>`]},{id:foreignId,to:['other@example.com']},{id:'missing'}] : [{id:ownId,from:`Flat Free <${address}>`},{id:foreignId,from:'other@example.com'}]});
  for (const action of ['inbox','sent']) {
    const response=await request(action,{cookie:session()});
    assert.deepEqual(response.body.data.map(row=>row.id),[ownId]);
    assert.equal(response.headers['Cache-Control'],'no-store');
  }
  assert.ok(calls.every(call=>call.headers.Authorization==='Bearer test-private-key'));
});
test('received and sent individual messages validate mailbox before exposing body', async () => {
  provider = url => ({id:url.endsWith(ownId)?ownId:foreignId, to:[url.endsWith(ownId)?address:'other@example.com'], from:url.endsWith(ownId)?address:'other@example.com',html:'<script>unsafe()</script><p>Readable</p>'});
  for (const kind of ['received','sent']) {
    const own=await request('message',{cookie:session(),query:`?kind=${kind}&id=${ownId}`});
    assert.equal(own.status,200); assert.ok(!own.body.text.includes('<script>')); assert.equal(own.body.html,undefined);
    const foreign=await request('message',{cookie:session(),query:`?kind=${kind}&id=${foreignId}`});
    assert.equal(foreign.status,404); assert.equal(foreign.body.text,undefined);
  }
  const before=calls.length;
  for (const query of ['?kind=received&id=../../emails','?kind=invalid&id='+ownId,'?kind=received&id='+'a'.repeat(40)]) assert.equal((await request('message',{cookie:session(),query})).status,400);
  assert.equal(calls.length,before);
});
const draft = {to:'delivered@resend.dev',cc:'copy@example.com',bcc:'hidden@example.com',subject:'Test',message:'Plain text'};
test('send uses fixed sender and dedicated key; validates recipients and fields', async () => {
  assert.equal((await request('send',{cookie:session(),body:{...draft,from:'spoof@example.com'}})).status,200);
  const payload=JSON.parse(calls[0].body);
  assert.equal(payload.from,`Flat Free Brasil <${address}>`); assert.equal(payload.text,draft.message); assert.equal(payload.html,undefined);
  assert.deepEqual(payload.cc,['copy@example.com']); assert.deepEqual(payload.bcc,['hidden@example.com']);
  for (const override of [{to:'invalid'},{to:['valid@example.com']},{cc:{}},{subject:'x'.repeat(201)},{message:'x'.repeat(20001)},{replyId:{}},{bcc:'x@example.com\r\nBcc:bad@example.com'}]) assert.equal((await request('send',{cookie:session(),body:{...draft,...override}})).status,422);
  assert.equal(calls.length,1);
});
test('replyId rejects foreign mailbox and malformed IDs before sending; valid replies preserve threading', async () => {
  provider = url=> url.includes('/receiving/') ? {id:ownId,to:[url.endsWith(ownId)?address:'other@example.com'],message_id:'<original@example.com>'} : {id:ownId};
  assert.equal((await request('send',{cookie:session(),body:{...draft,replyId:foreignId}})).status,404);
  assert.equal(calls.filter(call=>call.method==='POST').length,0);
  assert.equal((await request('send',{cookie:session(),body:{...draft,replyId:'invalid'}})).status,422);
  assert.equal((await request('send',{cookie:session(),body:{...draft,replyId:ownId}})).status,200);
  const sent=JSON.parse(calls.find(call=>call.method==='POST').body);
  assert.deepEqual(sent.headers,{'In-Reply-To':'<original@example.com>',References:'<original@example.com>'});
});
test('provider errors fail without leaking credentials', async () => {
  globalThis.fetch=async()=>new Response(JSON.stringify({secret:'test-private-key'}),{status:403});
  const response=await request('inbox',{cookie:session()});
  assert.equal(response.status,502); assert.ok(!JSON.stringify(response).includes('test-private-key'));
});
test('login rate limit caps repeated attempts',async()=>{
  for(let i=0;i<8;i++) assert.equal((await request('login',{body:{password:'wrong'}})).status,401);
  assert.equal((await request('login',{body:{password:'wrong'}})).status,429);
});
test('mail HTML is noindex, scripts render untrusted bodies using textContent, public form is byte-identical to base',()=>{
  const page=readFileSync(new URL('../lib/mail-page.ts',import.meta.url),'utf8');
  assert.ok(page.includes('noindex, nofollow, noarchive'));
  assert.ok(!page.includes('TUREIS'));
  assert.equal((page.match(/formnovalidate/g)||[]).length,2);
  const script=readFileSync(new URL('../public/flat-free-mail.js',import.meta.url),'utf8');
  assert.ok(script.includes('body.textContent=msg.text'));
  for(const path of ['app/api/solicitar/route.ts','app/solicitar/page.tsx']) {
    const original=execFileSync('git',['show',`4e80302797b03f6af03eec1bea43dd9e056672ff:${path}`]);
    const current=readFileSync(new URL('../'+path,import.meta.url));
    assert.equal(current.toString().replace(/\r\n/g,'\n'),original.toString());
  }
});
