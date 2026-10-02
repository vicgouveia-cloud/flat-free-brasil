import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de Dosagem',
  description: 'Consulte a dosagem de Flat Free para medidas de pneus e prepare uma solicitação com as quantidades calculadas.',
  alternates: {
    canonical: '/calculadora',
  },
  openGraph: {
    type: 'website',
    url: '/calculadora',
    title: 'Calculadora de Dosagem',
    description: 'Consulte a dosagem de Flat Free para medidas de pneus e prepare uma solicitação com as quantidades calculadas.',
    images: [
      {
        url: '/images/flat-free-product-hero.png',
        alt: 'Flat Free Brasil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Dosagem',
    description: 'Consulte a dosagem de Flat Free para medidas de pneus e prepare uma solicitação com as quantidades calculadas.',
    images: ['/images/flat-free-product-hero.png'],
  },
}

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return children
}
