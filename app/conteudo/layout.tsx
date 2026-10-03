import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conteúdo Flat Free',
  description: 'Artigos e demonstrações sobre Flat Free, aplicação, pneus, pressão, desgaste e acompanhamento operacional.',
  alternates: {
    canonical: '/conteudo',
  },
  openGraph: {
    type: 'website',
    url: '/conteudo',
    title: 'Conteúdo Flat Free',
    description: 'Artigos e demonstrações sobre Flat Free, aplicação, pneus, pressão, desgaste e acompanhamento operacional.',
    images: ['/images/flat-free-product-hero.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conteúdo Flat Free',
    description: 'Artigos e demonstrações sobre Flat Free, aplicação, pneus, pressão, desgaste e acompanhamento operacional.',
    images: ['/images/flat-free-product-hero.png'],
  },
}

export default function ConteudoLayout({ children }: { children: React.ReactNode }) {
  return children
}
