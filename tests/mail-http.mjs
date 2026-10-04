import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';

const base=process.env.TEST_MAIL_ORIGIN || 'http://127.0.0.1:4173';
const own='00000000-0000-4000-8000-000000000001';
const foreign='00000000-0000-4000-8000-000000000002';
const secret='local-test-session-secret-more-than-32-characters';
let cookie='';
let passed=0;
async function get(path,headers={}) {return fetch(base+path,{headers:{cookie,...headers},redirect:'manual'})}
async function post(action,body,headers={}) {return fetch(base+'/api/mail/'+action,{method:'POST',headers:{cookie,origin:base,'content-type':'application/json',...headers},body:JSON.stringify(body)})}
function check(name,value){assert.ok(value,name);passed++;console.log('PASS '+name)}
let r=await get('/mail'); check('/mail HTML + noindex',r.status===200 && r.headers.get('x-robots-tag')?.includes('noindex') && (await r.text()).includes('name="robots" content="noindex'));
r=await get('/mail/'); check('/mail/ redirect + noindex',r.status===308 && new URL(r.headers.get('location'),base).pathname==='/mail' && r.headers.get('x-robots-tag')?.includes('noindex'));
for (const path of ['/solicitar/','/api/solicitar/','/calculadora/']) {
  r=await get(path);check('public canonical redirect unchanged '+path,r.status===308 && new URL(r.headers.get('location'),base).pathname===path.slice(0,-1));
}
r=await get('/api/mail/status'); check('private credentials configured',(await r.json()).configured===true);
r=await get('/api/mail/inbox'); check('unauthenticated inbox',r.status===401);
r=await post('login',{password:'wrong'});check('bad login',r.status===401);
r=await post('login',{password:'local-test-password'});check('login',r.status===200);cookie=r.headers.get('set-cookie').split(';')[0];
r=await get('/api/mail/status'); check('authenticated session',(await r.json()).authenticated===true);
for(const value of [cookie+'.extra',cookie.replace(/.$/,'!'),(()=>{const ts=Date.now()-43200001;return `flat_free_mail=${ts}.${createHmac('sha256',secret).update(`mail:${ts}`).digest('base64url')}`})()]) {r=await get('/api/mail/inbox',{cookie:value});check('tampered/expired session',r.status===401)}
r=await post('send',{to:'delivered@resend.dev',subject:'Test',message:'Test'},{origin:'https://evil.example'});check('CSRF',r.status===403);
r=await post('send',{}, {'content-type':'text/plain'});check('content type',r.status===415);
for(const action of ['inbox','sent']) {r=await get('/api/mail/'+action);const data=await r.json();check(action+' filtered',r.status===200 && data.data.length===1 && data.data[0].id===own)}
for(const kind of ['received','sent']) {
  r=await get(`/api/mail/message?kind=${kind}&id=${own}`);check(kind+' own message',r.status===200 && (await r.json()).id===own);
  r=await get(`/api/mail/message?kind=${kind}&id=${foreign}`);check(kind+' foreign ID rejected',r.status===404);
}
const draft={to:'delivered@resend.dev',subject:'Test',message:'Test'};
r=await post('send',draft);check('send',r.status===200 && (await r.json()).ok);
r=await post('send',{...draft,replyId:foreign});check('foreign replyId rejected',r.status===404);
r=await post('send',{...draft,replyId:own});check('reply',r.status===200 && (await r.json()).ok);
r=await get('/solicitar');check('public form page',r.status===200 && (await r.text()).includes('Informe seu perfil e siga pelo atendimento correto.'));
r=await fetch(base+'/api/solicitar',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({Nome_ou_empresa:'Teste HTTP',Email:'delivered@resend.dev',Telefone:'00000000000',Cidade:'Teste',Estado:'SP'})});check('public form POST uses its separate key',r.status===200 && (await r.json()).ok);
r=await post('logout',{});check('logout',r.status===200 && r.headers.get('set-cookie').includes('Max-Age=0'));
console.log(JSON.stringify({passed,provider:'local fixture; no real email sent'}));
