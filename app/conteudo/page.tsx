import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'
import PublicFooter from '@/components/PublicFooter'

const topics = [
  {
    icon: 'fa-flask',
    title: 'Produto e aplicação',
    desc: 'Informações sobre Flat Free, dosagem, aplicação e demonstrações práticas do produto.',
  },
  {
    icon: 'fa-tire',
    title: 'Pneus e operação',
    desc: 'Conteúdo sobre perfurações, pressão, desgaste, manutenção e comportamento dos pneus no uso.',
  },
  {
    icon: 'fa-truck',
    title: 'Frotas e acompanhamento',
    desc: 'Leituras, ocorrências, histórico, testes e comparações para quem gerencia pneus em operação.',
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
              <h1 id="content-hero-title">Informação para <span>entender melhor o produto e os pneus.</span></h1>
              <p className="home-product-hero-description">
                Artigos e demonstrações sobre Flat Free, aplicação, pneus e operação — organizados para quem usa, compra, aplica ou gerencia uma frota.
              </p>
              <div className="home-product-hero-actions">
                <a href="#artigos" className="btn btn-primary btn-lg">
                  Ver artigos <i className="fas fa-arrow-right" aria-hidden="true" />
                </a>
                <a href="https://www.youtube.com/@flatfreebrasil" className="btn btn-secondary btn-lg" target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube" aria-hidden="true" /> Ver demonstrações
                </a>
              </div>
            </div>
            <figure className="home-product-hero-visual">
              <Image
                src="/images/flat-free-product-hero.png"
                alt="Flat Free Brasil"
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
              <span className="section-tag">O que você encontra aqui</span>
              <h2 id="content-topics-title" className="section-title">Conteúdo organizado por assunto.</h2>
              <p className="section-description">
                Use esta área para aprofundar o que não precisa ficar concentrado na Home: produto, aplicação, pneus e acompanhamento operacional.
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

        <section className="section" style={{ background: 'var(--bg-surface-elevated)' }} aria-labelledby="content-videos-title">
          <div className="container">
            <div className="home-tech-journey-cta">
              <div className="home-tech-cta-copy">
                <span className="section-tag" style={{ marginBottom: '.65rem' }}>Demonstrações</span>
                <h2 id="content-videos-title" style={{ fontSize: '1.35rem', marginBottom: '.35rem' }}>Veja o Flat Free na prática</h2>
                <p>Aplicações e demonstrações em vídeo estão reunidas no canal Flat Free Brasil.</p>
              </div>
              <div className="home-tech-cta-actions">
                <a href="https://www.youtube.com/@flatfreebrasil" className="btn btn-primary" target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube" aria-hidden="true" /> Abrir canal
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="artigos" className="section" aria-labelledby="content-featured-title">
          <div className="container" style={{ maxWidth: '920px' }}>
            <div className="section-header">
              <span className="section-tag">Artigos</span>
              <h2 id="content-featured-title" className="section-title">Aprofunde os temas mais importantes.</h2>
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
      <PublicFooter />
    </>
  )
}
