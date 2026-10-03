import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
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
