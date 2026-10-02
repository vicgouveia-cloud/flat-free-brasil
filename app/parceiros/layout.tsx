import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instaladores e Revendedores',
  description: 'Conheça Flat Free para oficinas, borracharias, concessionárias e prestadores interessados em instalar, comprar ou revender o produto.',
  alternates: {
    canonical: '/parceiros',
  },
  openGraph: {
    type: 'website',
    url: '/parceiros',
    title: 'Instaladores e Revendedores',
    description: 'Conheça Flat Free para oficinas, borracharias, concessionárias e prestadores interessados em instalar, comprar ou revender o produto.',
    images: [
      {
        url: '/images/flat-free-product-hero.png',
        alt: 'Flat Free Brasil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instaladores e Revendedores',
    description: 'Conheça Flat Free para oficinas, borracharias, concessionárias e prestadores interessados em instalar, comprar ou revender o produto.',
    images: ['/images/flat-free-product-hero.png'],
  },
}

export default function ParceirosLayout({ children }: { children: React.ReactNode }) {
  return children
}
