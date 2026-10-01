import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quero Flat Free',
  description: 'Solicite atendimento para sua frota, veículo particular ou para instalar e revender Flat Free.',
}

export default function SolicitarLayout({ children }: { children: React.ReactNode }) {
  return children
}
