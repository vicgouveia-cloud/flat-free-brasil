import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flat Free para Meu Veículo',
  description: 'Conheça Flat Free para seu veículo, consulte a dosagem e saiba como encontrar revenda ou aplicação na sua região.',
  alternates: {
    canonical: '/meu-veiculo',
  },
  openGraph: {
    type: 'website',
    url: '/meu-veiculo',
    title: 'Flat Free para Meu Veículo',
    description: 'Conheça Flat Free para seu veículo, consulte a dosagem e saiba como encontrar revenda ou aplicação na sua região.',
    images: [
      {
        url: '/images/flat-free-product-hero.png',
        alt: 'Flat Free Brasil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flat Free para Meu Veículo',
    description: 'Conheça Flat Free para seu veículo, consulte a dosagem e saiba como encontrar revenda ou aplicação na sua região.',
    images: ['/images/flat-free-product-hero.png'],
  },
}

export default function MeuVeiculoLayout({ children }: { children: React.ReactNode }) {
  return children
}
