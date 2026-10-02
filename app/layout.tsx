import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flat-free-brasil.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Flat Free Brasil | Proteção para Pneus',
    template: '%s | Flat Free Brasil',
  },
  description: 'Flat Free é aplicado no interior dos pneus para proteção contra perfurações compatíveis, preservação da pressão e melhor aproveitamento dos pneus em veículos e frotas.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Flat Free Brasil',
    title: 'Flat Free Brasil | Proteção para Pneus',
    description: 'Flat Free é aplicado no interior dos pneus para proteção contra perfurações compatíveis, preservação da pressão e melhor aproveitamento dos pneus.',
    images: [
      {
        url: '/images/flat-free-product-hero.png',
        alt: 'Flat Free Brasil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flat Free Brasil | Proteção para Pneus',
    description: 'Proteção contra perfurações compatíveis, preservação da pressão e melhor aproveitamento dos pneus.',
    images: ['/images/flat-free-product-hero.png'],
  },
  keywords: [
    'Flat Free',
    'selante de pneus',
    'proteção contra perfurações',
    'proteção de pneus',
    'aplicação em pneus',
    'Flat Free para frotas',
    'dosagem de selante para pneus',
  ],
  other: {
    'google-site-verification': 'google1f0a646a60421833',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
