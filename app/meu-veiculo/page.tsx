import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'
import PublicFooter from '@/components/PublicFooter'

const benefits = [
  {
    icon: 'fa-shield-halved',
    title: 'Proteção contra perfurações',
    desc: 'Flat Free permanece distribuído no interior do pneu e atua em perfurações compatíveis durante o uso.',
  },
  {
    icon: 'fa-gauge-high',
    title: 'Ajuda a preservar a calibragem',
    desc: 'Ao vedar perfurações compatíveis, o produto ajuda a reduzir perdas de pressão associadas a esses eventos.',
  },
  {
    icon: 'fa-road',
    title: 'Maior aproveitamento dos pneus',
    desc: 'A manutenção da pressão e a distribuição interna do produto ajudam a reduzir fatores ligados ao desgaste prematuro.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Identifique seu veículo e pneus',
    desc: 'Tenha em mãos o modelo do veículo, sua cidade e, se possível, a medida indicada na lateral dos pneus.',
  },
  {
    step: '02',
    title: 'Encontre revenda ou aplicação',
    desc: 'A Flat Free Brasil orienta você sobre revendedores, aplicadores, oficinas, borracharias ou outros pontos de atendimento na sua região.',
  },
  {
    step: '03',
    title: 'Faça a aplicação',
    desc: 'A dosagem varia conforme a medida do pneu. A aplicação é feita pela válvula, com a quantidade adequada para cada pneu.',
  },
]

export default function MeuVeiculoPage() {
  return (
    <>
      <HomeNav />
      <main>
        <section className="home-product-hero" aria-labelledby="vehicle-hero-title">
          <div className="container home-product-hero-grid">
            <div className="home-product-hero-copy">
              <span className="home-product-hero-eyebrow">Flat Free para seu veículo</span>
              <h1 id="vehicle-hero-title">Proteção que começa <span>dentro do pneu.</span></h1>
              <p className="home-product-hero-description">
                Flat Free é aplicado no interior dos pneus para proteger contra perfurações compatíveis, ajudar a preservar a pressão e contribuir para melhor aproveitamento dos pneus no uso diário.
              </p>
              <div className="home-product-hero-actions">
                <Link href="/solicitar?perfil=particular&interesse=onde-aplicar" className="btn btn-primary btn-lg">
                  Onde comprar ou aplicar <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
                <Link href="/calculadora" className="btn btn-secondary btn-lg">
                  <i className="fas fa-calculator" aria-hidden="true" /> Calcular aplicação
                </Link>
              </div>
            </div>
            <figure className="home-product-hero-visual">
              <Image
                src="/images/flat-free-product-hero.png"
                alt="Balde azul Flat Free com equipamento de aplicação"
                width={1536}
                height={1024}
                sizes="(max-width: 900px) calc(100vw - 48px), 55vw"
                priority
              />
              <figcaption>
                <span>Flat Free · 5 US gal / 18,9 L</span>
                <span>Aplicação conforme a medida do pneu</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section" aria-labelledby="vehicle-benefits-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Benefícios do produto</span>
              <h2 id="vehicle-benefits-title" className="section-title">Proteção, pressão e melhor aproveitamento.</h2>
              <p className="section-description">
                O produto atua dentro do pneu durante a rodagem. A aplicação correta começa pela medida e pela dosagem adequadas.
              </p>
            </div>
            <div className="grid-3">
              {benefits.map(item => (
                <article key={item.title} className="card">
                  <div className="home-journey-icon">
                    <i className={`fas ${item.icon}`} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '.65rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65 }}>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-surface-elevated)' }} aria-labelledby="vehicle-steps-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Como comprar e aplicar</span>
              <h2 id="vehicle-steps-title" className="section-title">Do seu veículo ao ponto de atendimento.</h2>
            </div>
            <div className="grid-3">
              {steps.map(item => (
                <article key={item.step} className="card">
                  <span className="home-tech-step-num">{item.step}</span>
                  <h3 style={{ fontSize: '1rem', margin: '.9rem 0 .5rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.86rem', lineHeight: 1.6 }}>{item.desc}</p>
                </article>
              ))}
            </div>
            <div className="home-tech-journey-cta" style={{ marginTop: '2rem' }}>
              <div className="home-tech-cta-copy">
                <h4>Quer encontrar onde comprar ou aplicar?</h4>
                <p>Informe sua cidade e os dados do veículo. A calculadora fica disponível como apoio para consultar a dosagem por medida.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/solicitar?perfil=particular&interesse=onde-aplicar" className="btn btn-primary">
                  Encontrar atendimento
                </Link>
                <Link href="/calculadora" className="btn btn-outline">
                  Calcular dosagem
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  )
}
