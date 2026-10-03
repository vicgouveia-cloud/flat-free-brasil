import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

const reasons = [
  {
    icon: 'fa-shield-halved',
    title: 'Benefícios claros para o cliente',
    desc: 'Proteção contra perfurações compatíveis, ajuda na manutenção da pressão e melhor aproveitamento dos pneus são benefícios fáceis de apresentar no atendimento.',
  },
  {
    icon: 'fa-screwdriver-wrench',
    title: 'Aplicação como parte do serviço',
    desc: 'Flat Free pode ser incorporado ao fluxo de oficinas, borracharias, concessionárias, centros automotivos e outros prestadores que já trabalham com pneus.',
  },
  {
    icon: 'fa-box-open',
    title: 'Compra para aplicar ou revender',
    desc: 'Converse com a Flat Free Brasil sobre fornecimento do produto para atendimento, aplicação e revenda.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Conheça o produto',
    desc: 'Entenda onde o Flat Free atua, quais benefícios entrega e para quais aplicações ele pode ser indicado.',
  },
  {
    step: '02',
    title: 'Consulte a dosagem',
    desc: 'Use a calculadora como apoio para identificar a quantidade de referência conforme a medida do pneu.',
  },
  {
    step: '03',
    title: 'Solicite fornecimento',
    desc: 'Informe seu estabelecimento, cidade, serviços oferecidos e interesse em comprar para aplicar ou revender.',
  },
]

export default function ParceirosPage() {
  return (
    <>
      <HomeNav />
      <main>
        <section className="home-product-hero" aria-labelledby="partners-hero-title">
          <div className="container home-product-hero-grid">
            <div className="home-product-hero-copy">
              <span className="home-product-hero-eyebrow">Revenda · Aplicação · Atendimento</span>
              <h1 id="partners-hero-title">Ofereça Flat Free <span>no seu negócio.</span></h1>
              <p className="home-product-hero-description">
                Oficinas, borracharias, concessionárias, centros automotivos e outros prestadores podem comprar Flat Free para aplicar ou revender aos seus clientes.
              </p>
              <div className="home-product-hero-actions">
                <Link href="/solicitar?perfil=parceiro&interesse=parceria" className="btn btn-primary btn-lg">
                  Quero comprar para revender ou aplicar <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
                <Link href="/calculadora" className="btn btn-secondary btn-lg">
                  <i className="fas fa-calculator" aria-hidden="true" /> Consultar dosagem
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
                <span>Flat Free · produto para pneus</span>
                <span>Aplicação profissional conforme a medida do pneu</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section" aria-labelledby="partners-reasons-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Para quem atende veículos e pneus</span>
              <h2 id="partners-reasons-title" className="section-title">Um produto para incorporar ao atendimento.</h2>
              <p className="section-description">
                Conheça os benefícios, consulte a dosagem e converse com a Flat Free Brasil sobre compra, aplicação e revenda.
              </p>
            </div>
            <div className="grid-3">
              {reasons.map(item => (
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

        <section className="section" style={{ background: 'var(--bg-surface-elevated)' }} aria-labelledby="partners-steps-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Como começar</span>
              <h2 id="partners-steps-title" className="section-title">Do conhecimento do produto ao atendimento.</h2>
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
                <h4>Quer comprar Flat Free para o seu negócio?</h4>
                <p>Conte onde você atende, quais serviços oferece e se pretende aplicar, revender ou fazer as duas coisas.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/solicitar?perfil=parceiro&interesse=parceria" className="btn btn-primary">
                  Solicitar fornecimento
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
