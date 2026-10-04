import { Readable } from 'node:stream'
import { createMailHandler } from '@/lib/mail.mjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The TUREIS handler stays server-side. Origins never come from request host headers.
const handler = createMailHandler({
  origin: process.env.MAIL_APP_ORIGIN || 'https://flatfreebrasil.com.br',
})

async function dispatch(request: Request) {
  const url = new URL(request.url)
  const input = request.body
    ? Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0])
    : Readable.from([])
  const req = Object.assign(input, {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    socket: {
      remoteAddress: process.env.VERCEL === '1'
        ? request.headers.get('x-vercel-forwarded-for') || 'unknown'
        : 'local',
    },
  })
  const headers = new Headers()
  let status = 200
  let body = ''
  const res = {
    setHeader(name: string, value: string) { headers.set(name, value) },
    writeHead(code: number, values: Record<string, string>) {
      status = code
      for (const [name, value] of Object.entries(values)) headers.set(name, value)
    },
    end(value: string) { body = value },
  }
  await handler(req, res, url.pathname.replace(/\/$/, ''), url)
  return new Response(body, { status, headers })
}

export { dispatch as GET, dispatch as POST, dispatch as PUT, dispatch as DELETE, dispatch as PATCH, dispatch as OPTIONS, dispatch as HEAD }
