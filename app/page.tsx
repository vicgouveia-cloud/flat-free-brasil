import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flatfreebrasil.com.br'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Flat Free Brasil',
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'Product',
      '@id': `${siteUrl}/#flat-free`,
      name: 'Flat Free',
      brand: {
        '@type': 'Brand',
        name: 'Flat Free',
      },
      image: `${siteUrl}/images/flat-free-product-hero.png`,
      description: 'Produto aplicado no interior dos pneus para proteção contra perfurações compatíveis, preservação da pressão e melhor aproveitamento dos pneus.',
      category: 'Proteção para pneus',
      url: siteUrl,
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeNav />
      <main>
        {/* HERO */}
        <section id="inicio" className="home-product-hero" aria-labelledby="home-hero-title">
          <div className="container home-product-hero-grid">
            <div className="home-product-hero-copy">
              <span className="home-product-hero-eyebrow">Flat Free Brasil · Produto para pneus</span>
              <h1 id="home-hero-title">A proteção começa <span>no pneu.</span></h1>
              <p className="home-product-hero-description">
                Conheça Flat Free, o produto aplicado no interior dos pneus para proteção contra perfurações, preservação da pressão e melhor aproveitamento dos pneus em operação.
              </p>
              <div className="home-product-hero-actions">
                <a href="#produto" className="btn btn-primary btn-lg">Conheça o Flat Free <i className="fas fa-arrow-right" aria-hidden="true" /></a>
                <a href="https://www.youtube.com/@flatfreebrasil" className="btn btn-secondary btn-lg" target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube" aria-hidden="true" /> Ver demonstrações
                </a>
              </div>
            </div>
            <figure className="home-product-hero-visual">
              <Image src="/images/flat-free-product-hero.png" alt="Apresentação comercial do balde azul Flat Free com bomba e mangueira de aplicação, ao lado da identidade da marca." width={1536} height={1024} sizes="(max-width: 900px) calc(100vw - 48px), (max-width: 1280px) 55vw, 660px" priority />
              <figcaption><span>Balde azul · 5 US gal / 18,9 L</span><span>Apresentação ilustrativa com equipamento de aplicação</span></figcaption>
            </figure>
          </div>
        </section>

        {/* BENEFITS */}
        <section id="produto" className="section" aria-labelledby="home-beneficios-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Conheça o Flat Free</span>
              <h2 id="home-beneficios-title" className="section-title">Proteção, pressão e maior aproveitamento do pneu.</h2>
              <p className="section-description">Aplicado no interior do pneu, Flat Free permanece disponível durante a rodagem para atuar em perfurações compatíveis e ajudar a preservar a condição de uso do pneu.</p>
            </div>
            <div className="grid-3">
              {[
                { icon: 'fa-shield-halved', title: 'Proteção contra perfurações', desc: 'Atua em perfurações compatíveis na região da banda de rodagem, inclusive aberturas de até cerca de 6 mm de diâmetro.', tag: 'Proteção' },
                { icon: 'fa-gauge-high', title: 'Manutenção da pressão', desc: 'Ao vedar perfurações compatíveis, Flat Free ajuda a preservar a calibragem e a condição de rodagem do pneu.', tag: 'Calibragem' },
                { icon: 'fa-road', title: 'Maior vida útil e eficiência', desc: 'A manutenção da pressão e a distribuição interna do produto ajudam a reduzir fatores associados ao desgaste prematuro e à resistência ao rolamento.', tag: 'Durabilidade' },
              ].map(card => (
                <div key={card.title} className="card" style={{ transition: 'transform 0.2s', cursor: 'default' }}>
                  <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,92,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <i className={`fas ${card.icon}`} style={{ fontSize: '1.2rem', color: 'var(--color-safety-orange)' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.05rem' }}>{card.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>{card.desc}</p>
                  <span style={{ background: 'rgba(132,204,22,0.15)', color: 'var(--color-industrial-lime)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>{card.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT HIGHLIGHTS */}
        <section id="caracteristicas" className="section home-tech-section" aria-labelledby="home-highlights-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Destaques do produto</span>
              <h2 id="home-highlights-title" className="section-title">Características do Flat Free</h2>
              <p className="section-description">Pontos práticos sobre aplicação e comportamento do produto dentro do pneu.</p>
            </div>

            <div className="grid-4">
              {[
                {
                  icon: 'fa-droplet',
                  title: 'Aplicação fácil pela válvula',
                  desc: 'É aplicado pela haste da válvula com o pneu montado, sem necessidade de desmontar a roda.',
                },
                {
                  icon: 'fa-hourglass-half',
                  title: 'Não seca no pneu',
                  desc: 'Permanece em condição líquida no interior do pneu, disponível durante o ciclo de uso.',
                },
                {
                  icon: 'fa-fire-flame-curved',
                  title: 'Não inflamável',
                  desc: 'A formulação é não inflamável e foi desenvolvida para uso preventivo dentro do pneu.',
                },
                {
                  icon: 'fa-temperature-half',
                  title: 'Testado em condições extremas',
                  desc: 'O produto foi submetido a testes de estabilidade em temperaturas extremas.',
                },
              ].map(item => (
                <article key={item.title} className="card">
                  <div className="home-journey-icon">
                    <i className={`fas ${item.icon}`} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '.55rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.86rem', lineHeight: 1.6 }}>{item.desc}</p>
                </article>
              ))}
            </div>

            <div className="home-tech-journey-cta" style={{ marginTop: '2rem' }}>
              <div className="home-tech-cta-copy">
                <h4>Veja o Flat Free na prática</h4>
                <p>Demonstrações de aplicação e funcionamento estão disponíveis no canal Flat Free Brasil.</p>
              </div>
              <div className="home-tech-cta-actions">
                <a href="https://www.youtube.com/@flatfreebrasil" className="btn btn-primary" target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube" aria-hidden="true" /> Ver demonstrações
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCES */}
        <section id="caminhos" className="section home-audiences-section" aria-labelledby="home-audiences-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Para você, sua empresa ou seu negócio</span>
              <h2 id="home-audiences-title" className="section-title">Como você quer usar o Flat Free?</h2>
              <p className="section-description">Escolha a opção que corresponde ao seu perfil para ver informações, atendimento e próximos passos.</p>
            </div>
            <div className="home-audiences-grid">
              {[
                {
                  badge: 'Uso no dia a dia',
                  icon: 'fa-car-side',
                  title: 'Meu veículo',
                  desc: 'Conheça os benefícios, consulte a dosagem e veja como seguir para compra e aplicação.',
                  href: '/meu-veiculo',
                  cta: 'Ver para meu veículo',
                  isPrimary: true,
                },
                {
                  badge: 'Gestão e histórico',
                  icon: 'fa-truck',
                  title: 'Frotas e empresas',
                  desc: 'Conheça a aplicação para frotas, testes piloto e a área de acompanhamento dos pneus.',
                  href: '/frotas',
                  cta: 'Ver solução para frotas',
                  isPrimary: false,
                },
                {
                  badge: 'Rede de atendimento',
                  icon: 'fa-screwdriver-wrench',
                  title: 'Revenda e instalação',
                  desc: 'Conheça o produto, a aplicação e como conversar com a Flat Free Brasil sobre fornecimento e parceria.',
                  href: '/parceiros',
                  cta: 'Quero revender',
                  isPrimary: false,
                },
              ].map(item => (
                <div key={item.title} className={`home-journey-card${item.isPrimary ? ' home-journey-card-primary' : ''}`}>
                  <span className="home-journey-badge">{item.badge}</span>
                  <div className="home-journey-icon">
                    <i className={`fas ${item.icon}`} aria-hidden="true" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link href={item.href} className={`btn ${item.isPrimary ? 'btn-primary' : 'btn-outline'} home-journey-cta`}>
                    {item.cta} <i className="fas fa-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="section" style={{ padding: '2.25rem 0' }} aria-label="Conteúdo e demonstrações">
          <div className="container">
            <div className="home-tech-journey-cta">
              <div className="home-tech-cta-copy">
                <h4>Conteúdo e demonstrações</h4>
                <p>Vídeos e artigos sobre aplicação, pneus, operação e uso do Flat Free.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/conteudo" className="btn btn-outline">Acessar conteúdo <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1e', color: '#fff', padding: '3rem 0 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div className="public-footer-grid" style={{ marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.75rem' }}>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>Proteção contra perfurações, preservação da pressão e melhor aproveitamento dos pneus.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Navegação</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Início:#inicio','Produto:#produto','Características:#caracteristicas','Perfil de uso:#caminhos'].map(item => {
                  const [label, href] = item.split(':')
                  return <li key={href}><a href={href} style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</a></li>
                })}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Flat Free</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/meu-veiculo" style={{ color: '#64748b', fontSize: '0.875rem' }}>Meu veículo</Link></li>
                <li><Link href="/frotas" style={{ color: '#64748b', fontSize: '0.875rem' }}>Para frotas</Link></li>
                <li><Link href="/parceiros" style={{ color: '#64748b', fontSize: '0.875rem' }}>Parceiros</Link></li>
                <li><Link href="/calculadora" style={{ color: '#64748b', fontSize: '0.875rem' }}>Calcular dosagem</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Atendimento</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/calculadora" style={{ color: '#64748b', fontSize: '0.875rem' }}>Consultar aplicação</Link></li>
                <li><Link href="/conteudo" style={{ color: '#64748b', fontSize: '0.875rem' }}>Conteúdo e demonstrações</Link></li>
                <li><Link href="/parceiros" style={{ color: '#64748b', fontSize: '0.875rem' }}>Quero ser parceiro</Link></li>
              </ul>
            </div>
          </div>
          <div className="public-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>© 2026 Flat Free Brasil - Todos os direitos reservados.</span>
            <span>Proteção e melhor aproveitamento dos pneus.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
