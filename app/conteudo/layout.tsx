import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conteúdo sobre Pneus',
  description: 'Conteúdo Flat Free sobre pressão, desgaste, perfurações, aplicação e acompanhamento de pneus.',
  alternates: {
    canonical: '/conteudo',
  },
  openGraph: {
    type: 'website',
    url: '/conteudo',
    title: 'Conteúdo sobre Pneus',
    description: 'Conteúdo Flat Free sobre pressão, desgaste, perfurações, aplicação e acompanhamento de pneus.',
    images: ['/images/hero_trucks_fleet.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conteúdo sobre Pneus',
    description: 'Conteúdo Flat Free sobre pressão, desgaste, perfurações, aplicação e acompanhamento de pneus.',
    images: ['/images/hero_trucks_fleet.jpg'],
  },
}

export default function ConteudoLayout({ children }: { children: React.ReactNode }) {
  return children
}
