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
  ['fa-tire', 'Pneus e ciclos', 'Cadastre pneus novos ou recapados e acompanhe cada ciclo de uso.'],
  ['fa-truck-moving', 'Veículos e posições', 'Registre montagem, eixo, posição e movimentações ao longo do tempo.'],
  ['fa-ruler-vertical', 'Leituras', 'Acompanhe sulco, quilometragem e pressão em inspeções periódicas.'],
  ['fa-triangle-exclamation', 'Ocorrências', 'Registre perfurações, reparos, perdas de pressão, retiradas e recapagens.'],
  ['fa-flask', 'Tratado x controle', 'Organize projetos com pneus tratados e pneus de controle para comparação.'],
  ['fa-chart-line', 'Comparativos', 'Use os dados registrados para observar desgaste, km/mm, ocorrências e custo observado por km.'],
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
                Para transportadoras, operações de carga e empresas de ônibus, Flat Free combina proteção do pneu com uma forma prática de acompanhar a operação. Você pode começar com um teste, medir pneus tratados e de controle e decidir a expansão com dados da própria frota.
              </p>
              <div className="home-product-hero-actions">
                <Link href="/solicitar?perfil=frota&interesse=produto" className="btn btn-primary btn-lg">
                  Solicitar produto ou teste <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
                <Link href="/solicitar?perfil=frota&interesse=gestao" className="btn btn-secondary btn-lg">
                  Solicitar acesso à gestão
                </Link>
              </div>
              <div className="home-product-hero-fleet">
                <p>Já utiliza a área de acompanhamento?</p>
                <Link href="/app">Acessar gestão de pneus <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
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
              <span className="section-tag">O produto na operação</span>
              <h2 id="fleet-benefits-title" className="section-title">Por que Flat Free interessa a uma frota</h2>
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
              <span className="section-tag">Área do cliente e do prospect</span>
              <h2 id="fleet-management-title" className="section-title">Comece a conhecer seus pneus antes mesmo da aplicação</h2>
              <p className="section-description">
                A área de gestão pode ser usada para organizar a frota, iniciar leituras e criar uma base de comparação. Quando Flat Free for aplicado, o tratamento passa a fazer parte do histórico de cada pneu.
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
                <h4>Quer organizar a frota ou preparar um teste?</h4>
                <p>Solicite acesso para começar o acompanhamento ou fale com a equipe sobre produto, dosagem e aplicação piloto.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/solicitar?perfil=frota&interesse=gestao" className="btn btn-outline">
                  Solicitar acesso
                </Link>
                <Link href="/solicitar?perfil=frota&interesse=produto" className="btn btn-primary">
                  Falar sobre Flat Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ background: 'var(--bg-surface-elevated)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <span className="section-tag">Próximo passo</span>
            <h2 className="section-title">Produto, teste e acompanhamento no mesmo caminho</h2>
            <p className="section-description" style={{ marginBottom: '1.5rem' }}>
              Conte como é sua operação e qual é o objetivo inicial. A solicitação pode começar pelo produto, por um teste piloto ou pelo acesso à gestão dos pneus.
            </p>
            <Link href="/solicitar?perfil=frota" className="btn btn-primary btn-lg">
              Falar com a Flat Free
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
