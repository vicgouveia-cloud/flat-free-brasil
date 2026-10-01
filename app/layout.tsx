import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Flat Free Brasil | Proteção e Gestão de Pneus',
    template: '%s | Flat Free Brasil',
  },
  description: 'Flat Free combina proteção preventiva contra perfurações com ferramentas para acompanhar aplicações, posições, leituras e histórico dos pneus de veículos e frotas.',
  keywords: [
    'Flat Free',
    'selante de pneus',
    'proteção contra perfurações',
    'gestão de pneus',
    'gestão de pneus de frota',
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
