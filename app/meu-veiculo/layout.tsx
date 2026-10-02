import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flat Free para Meu Veículo',
  description: 'Conheça Flat Free para seu veículo, consulte a dosagem e saiba como encontrar revenda ou aplicação na sua região.',
  alternates: {
    canonical: '/meu-veiculo',
  },
}

export default function MeuVeiculoLayout({ children }: { children: React.ReactNode }) {
  return children
}
