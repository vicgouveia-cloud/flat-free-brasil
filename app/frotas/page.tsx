import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

const productBenefits = [
  {
    icon: 'fa-shield-halved',
    title: 'Proteção contra perfurações',
    desc: 'Flat Free atua na região interna da banda de rodagem para vedar perfurações compatíveis e reduzir o impacto de ocorrências no uso diário.',
  },
  {
    icon: 'fa-temperature-half',
    title: 'Vida útil do pneu',
    desc: 'A distribuição interna do produto e a preservação da pressão ajudam a reduzir fatores ligados ao aquecimento e ao desgaste prematuro dos pneus.',
  },
  {
    icon: 'fa-gas-pump',
    title: 'Eficiência de combustível',
    desc: 'Ao ajudar a manter a calibragem e a condição de rodagem, Flat Free contribui para reduzir resistência ao rolamento e consumo desnecessário de combustível.',
  },
]

const pilotSteps = [
  {
    step: '01',
    title: 'Defina um grupo de teste',
    desc: 'Escolha pneus tratados e, quando fizer sentido, pneus de controle em condições comparáveis.',
  },
  {
    step: '02',
    title: 'Registre a condição inicial',
    desc: 'Sulco, quilometragem, pressão, veículo e posição criam a linha de base para o acompanhamento.',
  },
  {
    step: '03',
    title: 'Aplique Flat Free',
    desc: 'Registre a aplicação, a dose utilizada e o momento em que o pneu passou a integrar o teste.',
  },
  {
    step: '04',
    title: 'Meça e compare',
    desc: 'Acompanhe leituras, ocorrências, desgaste e quilometragem para avaliar os resultados na própria operação.',
  },
]

const managementFeatures = [
  ['fa-tire', 'Histórico do pneu', 'Cadastre pneus, ciclos, veículos, posições e movimentações ao longo do tempo.'],
  ['fa-ruler-vertical', 'Leituras e ocorrências', 'Registre sulco, quilometragem, pressão, perfurações, reparos, retiradas e recapagens.'],
  ['fa-chart-line', 'Teste e comparação', 'Organize pneus tratados e de controle para observar desgaste, km/mm, ocorrências e custo observado por km.'],
]

export default function FrotasPage() {
  return (
    <>
      <HomeNav />
      <main>
        <section className="home-product-hero" aria-labelledby="fleet-hero-title">
          <div className="container home-product-hero-grid">
            <div className="home-product-hero-copy">
              <span className="home-product-hero-eyebrow">Flat Free para frotas</span>
              <h1 id="fleet-hero-title">Proteja os pneus. <span>Meça os resultados.</span></h1>
              <p className="home-product-hero-description">
                Transportadoras, empresas de ônibus e outras operações com frota podem comprar Flat Free diretamente, começar com um teste piloto e acompanhar os resultados antes de ampliar a aplicação.
              </p>
              <div className="home-product-hero-actions">
                <Link href="/solicitar?perfil=frota&interesse=produto" className="btn btn-primary btn-lg">
                  Comprar ou iniciar um teste <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
                <Link href="/calculadora" className="btn btn-secondary btn-lg">
                  <i className="fas fa-calculator" aria-hidden="true" /> Consultar dosagem
                </Link>
              </div>
              <div className="home-product-hero-fleet">
                <p>A gestão de pneus é uma ferramenta adicional para organizar leituras, histórico e testes da frota.</p>
                <Link href="/solicitar?perfil=frota&interesse=gestao">Solicitar acesso à gestão <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              </div>
            </div>
            <figure className="home-product-hero-visual">
              <Image
                src="/images/hero_trucks_fleet.jpg"
                alt="Caminhões em operação de frota"
                width={1200}
                height={800}
                sizes="(max-width: 900px) calc(100vw - 48px), 55vw"
                priority
              />
              <figcaption>
                <span>Produto + acompanhamento</span>
                <span>Teste na sua própria operação</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section" aria-labelledby="fleet-benefits-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Flat Free na operação</span>
              <h2 id="fleet-benefits-title" className="section-title">Proteção para pneus que trabalham todos os dias.</h2>
              <p className="section-description">
                O objetivo é reduzir problemas que tiram desempenho do pneu e da operação: perfurações, perda de pressão, aquecimento, desgaste e consumo desnecessário.
              </p>
            </div>
            <div className="grid-3">
              {productBenefits.map(item => (
                <article key={item.title} className="card">
                  <div className="home-journey-icon"><i className={`fas ${item.icon}`} aria-hidden="true" /></div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '.65rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.65 }}>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-surface-elevated)' }} aria-labelledby="fleet-pilot-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Teste antes de ampliar</span>
              <h2 id="fleet-pilot-title" className="section-title">Acompanhe o Flat Free dentro da sua própria frota</h2>
              <p className="section-description">
                Uma operação pode começar com parte dos pneus, manter um grupo de controle e acompanhar a evolução antes de decidir uma aplicação maior.
              </p>
            </div>
            <div className="grid-4">
              {pilotSteps.map(item => (
                <article key={item.step} className="card">
                  <span className="home-tech-step-num">{item.step}</span>
                  <h3 style={{ fontSize: '1rem', margin: '.9rem 0 .5rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.86rem', lineHeight: 1.6 }}>{item.desc}</p>
                </article>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <Link href="/solicitar?perfil=frota&interesse=produto" className="btn btn-primary btn-lg">
                Quero avaliar Flat Free na frota
              </Link>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="fleet-management-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Gestão de pneus</span>
              <h2 id="fleet-management-title" className="section-title">Use os dados da própria frota para acompanhar o teste.</h2>
              <p className="section-description">
                A ferramenta de gestão pode começar antes da aplicação: organize pneus e leituras, crie uma linha de base e depois acompanhe o histórico dos pneus tratados e de controle.
              </p>
            </div>

            <div className="grid-3">
              {managementFeatures.map(([icon, title, desc]) => (
                <article key={title} className="card">
                  <div className="home-journey-icon"><i className={`fas ${icon}`} aria-hidden="true" /></div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '.5rem' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.86rem', lineHeight: 1.6 }}>{desc}</p>
                </article>
              ))}
            </div>

            <div className="home-tech-journey-cta" style={{ marginTop: '2rem' }}>
              <div className="home-tech-cta-copy">
                <h4>Quer testar Flat Free com acompanhamento?</h4>
                <p>Fale com a equipe sobre produto, dosagem, grupo piloto e acesso à gestão de pneus.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/solicitar?perfil=frota&interesse=produto" className="btn btn-primary">
                  Falar sobre teste ou compra
                </Link>
                <Link href="/solicitar?perfil=frota&interesse=gestao" className="btn btn-outline">
                  Solicitar acesso à gestão
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
