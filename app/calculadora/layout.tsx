import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de Dosagem',
  description: 'Consulte a dosagem de Flat Free para medidas de pneus e prepare uma solicitação com as quantidades calculadas.',
}

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return children
}
