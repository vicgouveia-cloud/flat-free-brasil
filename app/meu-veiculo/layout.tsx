import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flat Free para Meu Veículo',
  description: 'Conheça Flat Free para seu veículo, consulte a dosagem pela medida dos pneus e solicite orientação para compra e aplicação.',
}

export default function MeuVeiculoLayout({ children }: { children: React.ReactNode }) {
  return children
}
