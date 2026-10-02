import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

const topics = [
  {
    icon: 'fa-shield-halved',
    title: 'Perfurações e prevenção',
    desc: 'Entenda como ocorrências no pneu afetam a operação e por que a prevenção ajuda a reduzir interrupções.',
  },
  {
    icon: 'fa-gauge-high',
    title: 'Pressão e calibragem',
    desc: 'Acompanhar a pressão ajuda a preservar a condição de rodagem e a identificar mudanças ao longo do uso.',
  },
  {
    icon: 'fa-ruler-vertical',
    title: 'Desgaste e vida útil',
    desc: 'Leituras de sulco e quilometragem ajudam a enxergar o comportamento do pneu ao longo do tempo.',
  },
]

export default function ConteudoPage() {
  return (
    <>
      <HomeNav />
      <main>
        <section className="home-product-hero" aria-labelledby="content-hero-title">
          <div className="container home-product-hero-grid">
            <div className="home-product-hero-copy">
              <span className="home-product-hero-eyebrow">Conteúdo Flat Free</span>
              <h1 id="content-hero-title">Conhecimento para <span>cuidar melhor dos pneus.</span></h1>
              <p className="home-product-hero-description">
                Conteúdo sobre aplicação, pressão, desgaste, ocorrências e acompanhamento de pneus para usuários, frotas e parceiros.
              </p>
            </div>
            <figure className="home-product-hero-visual">
              <Image
                src="/images/hero_trucks_fleet.jpg"
                alt="Pneus e veículos em operação"
                width={1400}
                height={900}
                sizes="(max-width: 900px) calc(100vw - 48px), 55vw"
                priority
              />
            </figure>
          </div>
        </section>

        <section className="section" aria-labelledby="content-topics-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Temas</span>
              <h2 id="content-topics-title" className="section-title">Pneus na prática</h2>
              <p className="section-description">
                Informações para apoiar decisões de uso, manutenção e acompanhamento sem transformar a Home em uma página excessivamente longa.
              </p>
            </div>
            <div className="grid-3">
              {topics.map(topic => (
                <article key={topic.title} className="card">
                  <div className="home-journey-icon">
                    <i className={`fas ${topic.icon}`} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '.65rem' }}>{topic.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65 }}>{topic.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-surface-elevated)' }} aria-labelledby="content-featured-title">
          <div className="container" style={{ maxWidth: '920px' }}>
            <div className="section-header">
              <span className="section-tag">Leitura em destaque</span>
              <h2 id="content-featured-title" className="section-title">Acompanhar pneus e ocorrências na operação</h2>
            </div>
            <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <Image
                src="/images/hero_trucks_fleet.jpg"
                alt="Caminhões em operação de frota"
                width={1400}
                height={700}
                sizes="(max-width: 920px) calc(100vw - 48px), 920px"
                style={{ width: '100%', height: '240px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  Perfurações, paradas, trocas, leituras e movimentações fazem parte da rotina de pneus. Quando esses eventos são registrados de forma organizada, fica mais fácil entender o histórico de cada pneu e comparar seu comportamento ao longo do uso.
                </p>
                <Link href="/conteudo/acompanhar-pneus-e-ocorrencias" className="btn btn-primary">
                  Ler conteúdo <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  )
}
