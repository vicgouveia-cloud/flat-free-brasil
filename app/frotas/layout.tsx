import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flat Free para Frotas',
  description: 'Conheça Flat Free para transportadoras, empresas de ônibus e operações com frotas. Solicite produto, teste piloto ou acesso à gestão de pneus.',
  alternates: {
    canonical: '/frotas',
  },
  openGraph: {
    type: 'website',
    url: '/frotas',
    title: 'Flat Free para Frotas',
    description: 'Conheça Flat Free para transportadoras, empresas de ônibus e operações com frotas. Solicite produto, teste piloto ou acesso à gestão de pneus.',
    images: [
      {
        url: '/images/flat-free-product-hero.png',
        alt: 'Flat Free Brasil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flat Free para Frotas',
    description: 'Conheça Flat Free para transportadoras, empresas de ônibus e operações com frotas. Solicite produto, teste piloto ou acesso à gestão de pneus.',
    images: ['/images/flat-free-product-hero.png'],
  },
}

export default function FrotasLayout({ children }: { children: React.ReactNode }) {
  return children
}
