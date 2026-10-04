// Local HTTP verification only. Never imported by application code or configured on Vercel.
if (process.env.VERCEL === '1') throw new Error('Local fixture cannot run on Vercel');
Object.assign(process.env, {
  MAIL_APP_ORIGIN: 'http://127.0.0.1:4173',
  MAIL_ADMIN_PASSWORD: 'local-test-password',
  MAIL_SESSION_SECRET: 'local-test-session-secret-more-than-32-characters',
  RESEND_MAIL_API_KEY: 'local-mail-test-key',
  RESEND_API_KEY: 'local-form-test-key',
});
const originalFetch = globalThis.fetch;
const own = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
globalThis.fetch = async (input, options = {}) => {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith('https://api.resend.com/')) return originalFetch(input, options);
  const headers = new Headers(options.headers);
  const key = headers.get('authorization');
  const payload = options.body ? JSON.parse(options.body) : null;
  if (key === 'Bearer local-form-test-key') {
    if (!payload || payload.from !== 'Flat Free Brasil <contato@flatfreebrasil.com.br>' || payload.to?.[0] !== 'contato@flatfreebrasil.com.br') return Response.json({error:'incorrect public configuration'},{status:400});
    return Response.json({id:own});
  }
  if (key !== 'Bearer local-mail-test-key') return Response.json({error:'wrong private key'},{status:403});
  if (options.method === 'POST') return Response.json({id:own});
  const message = id => ({id,from:id===own?'Flat Free Brasil <contato@flatfreebrasil.com.br>':'Other <other@example.com>',to:[id===own?'contato@flatfreebrasil.com.br':'other@example.com'],reply_to:['contato@flatfreebrasil.com.br'],subject:id===own?'Teste da caixa Flat Free':'Mensagem de outra caixa',text:'Conteúdo de teste. <script>não executar</script>',message_id:'<local-test@example.com>',created_at:'2026-10-04T09:00:00Z'});
  if (url.includes('?limit=')) return Response.json({data:[message(own),message(other)]});
  return Response.json(message(url.split('/').at(-1)));
};
