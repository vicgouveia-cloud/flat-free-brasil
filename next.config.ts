import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [{
      source: '/mail/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        { key: 'Cache-Control', value: 'no-store' },
      ],
    }]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.flatfreebrasil.com.br' }],
        destination: 'https://flatfreebrasil.com.br/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
