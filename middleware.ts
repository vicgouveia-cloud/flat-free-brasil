import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Plain URL avoids NextURL preserving the original trailing-slash flag.
  const url = new URL(request.url)
  const trailingSlash = url.pathname.endsWith('/')
  if (trailingSlash) url.pathname = url.pathname.replace(/\/+$/, '')
  const response = trailingSlash ? NextResponse.redirect(url, 308) : NextResponse.next()
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export const config = { matcher: ['/mail/:path*'] }
