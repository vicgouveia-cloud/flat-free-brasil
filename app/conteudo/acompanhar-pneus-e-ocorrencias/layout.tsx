import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Por que acompanhar pneus e ocorrências na operação',
  description: 'Entenda por que registrar leituras, posições, perfurações, reparos e outros eventos ajuda a construir um histórico útil dos pneus.',
  alternates: {
    canonical: '/conteudo/acompanhar-pneus-e-ocorrencias',
  },
  openGraph: {
    type: 'article',
    url: '/conteudo/acompanhar-pneus-e-ocorrencias',
    title: 'Por que acompanhar pneus e ocorrências na operação',
    description: 'Entenda por que registrar leituras, posições, perfurações, reparos e outros eventos ajuda a construir um histórico útil dos pneus.',
    images: ['/images/hero_trucks_fleet.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Por que acompanhar pneus e ocorrências na operação',
    description: 'Entenda por que registrar leituras, posições, perfurações, reparos e outros eventos ajuda a construir um histórico útil dos pneus.',
    images: ['/images/hero_trucks_fleet.jpg'],
  },
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
