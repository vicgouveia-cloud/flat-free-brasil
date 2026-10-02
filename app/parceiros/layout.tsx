import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instaladores e Revendedores',
  description: 'Conheça Flat Free para oficinas, borracharias, concessionárias e prestadores interessados em instalar, comprar ou revender o produto.',
  alternates: {
    canonical: '/parceiros',
  },
}

export default function ParceirosLayout({ children }: { children: React.ReactNode }) {
  return children
}
