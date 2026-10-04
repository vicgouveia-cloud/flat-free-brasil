import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flatfreebrasil.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/mail', '/api/mail/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
