import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flat Free para Frotas',
  description: 'Conheça Flat Free para transportadoras, empresas de ônibus e operações com frotas. Solicite produto, teste piloto ou acesso à gestão de pneus.',
  alternates: {
    canonical: '/frotas',
  },
}

export default function FrotasLayout({ children }: { children: React.ReactNode }) {
  return children
}
