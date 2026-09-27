import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FLAT FREE B2B - Selante & Blindagem Industrial de Pneus para Frotas',
  description: 'Solução B2B em selantes e extensores de vida útil de pneus para frotas comerciais, logísticas e industriais. Reduza o consumo de combustível e elimine paradas imprevistas.',
  keywords: 'selante de pneus, blindagem de pneu frota, pneu caminhão B2B, redução de downtime, economia combustível diesel, Flat Free',
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
