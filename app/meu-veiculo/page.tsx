import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

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
    title: 'Informe a medida',
    desc: 'Consulte a medida escrita na lateral do pneu e use a calculadora para obter a dosagem de referência.',
  },
  {
    step: '02',
    title: 'Calcule a aplicação',
    desc: 'Veja a quantidade indicada por pneu e o total necessário para o conjunto do veículo.',
  },
  {
    step: '03',
    title: 'Solicite atendimento',
    desc: 'Envie seus dados para confirmar disponibilidade, aplicação e orientação de compra.',
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
                <Link href="/calculadora" className="btn btn-primary btn-lg">
                  <i className="fas fa-calculator" aria-hidden="true" /> Calcular aplicação
                </Link>
                <Link href="/solicitar?perfil=particular&interesse=compra" className="btn btn-secondary btn-lg">
                  Quero Flat Free
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
              <span className="section-tag">Do pneu ao atendimento</span>
              <h2 id="vehicle-steps-title" className="section-title">Descubra quanto precisa e siga para a aplicação.</h2>
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
                <h4>Já sabe a medida dos pneus?</h4>
                <p>Calcule a quantidade de referência ou envie seus dados para receber orientação de atendimento.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/calculadora" className="btn btn-outline">
                  Calcular dosagem
                </Link>
                <Link href="/solicitar?perfil=particular&interesse=compra" className="btn btn-primary">
                  Solicitar atendimento
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="vehicle-application-title">
          <div className="container" style={{ maxWidth: '820px' }}>
            <div className="section-header">
              <span className="section-tag">Compra e aplicação</span>
              <h2 id="vehicle-application-title" className="section-title">Quer saber onde comprar ou aplicar Flat Free?</h2>
              <p className="section-description">
                Envie sua cidade, veículo e medida dos pneus. A equipe poderá orientar disponibilidade, quantidade e opções de atendimento conforme sua região.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/solicitar?perfil=particular&interesse=compra" className="btn btn-primary btn-lg">
                Quero Flat Free <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
