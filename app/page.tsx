'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flat-free-brasil.vercel.app'

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
  // Contact form
  const [formState, setFormState] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ perfil: 'frota', nome: '', empresa: '', email: '', frota: '11-50', mensagem: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.nome || !formData.email || (formData.perfil !== 'particular' && !formData.empresa)) {
      alert('Por favor, preencha os campos obrigatórios.')
      return
    }
    setFormState('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/vicgouveia@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: '[FLAT FREE] Novo contato pelo site',
          _template: 'table',
          Perfil: formData.perfil === 'frota' ? 'Empresa / frota' : formData.perfil === 'particular' ? 'Veículo particular' : 'Instalador / revendedor',
          Nome: formData.nome,
          Empresa: formData.empresa || 'Não informado',
          Email: formData.email,
          Tamanho_da_Frota: formData.perfil === 'frota' ? formData.frota : 'Não se aplica',
          Mensagem: formData.mensagem || 'Sem mensagem adicional.',
        }),
      })
      if (res.ok) { setShowModal(true); setFormState('idle') }
      else setFormState('error')
    } catch { setFormState('error') }
  }

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
                <a href="#caminhos" className="btn btn-primary btn-lg">Quero Flat Free <i className="fas fa-arrow-right" aria-hidden="true" /></a>
                <Link href="/calculadora" className="btn btn-secondary btn-lg"><i className="fas fa-calculator" aria-hidden="true" /> Calcular aplicação</Link>
              </div>
            </div>
            <figure className="home-product-hero-visual">
              <Image src="/images/flat-free-product-hero.png" alt="Apresentação comercial do balde azul Flat Free com bomba e mangueira de aplicação, ao lado da identidade da marca." width={1536} height={1024} sizes="(max-width: 900px) calc(100vw - 48px), (max-width: 1280px) 55vw, 660px" priority />
              <figcaption><span>Balde azul · 5 US gal / 18,9 L</span><span>Apresentação ilustrativa com equipamento de aplicação</span></figcaption>
            </figure>
          </div>
        </section>

        {/* BENEFITS */}
        <section id="beneficios" className="section" aria-labelledby="home-beneficios-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Benefícios do produto</span>
              <h2 id="home-beneficios-title" className="section-title">Proteção, pressão e maior aproveitamento do pneu.</h2>
              <p className="section-description">Flat Free atua dentro do pneu para ajudar a preservar sua condição de rodagem, reduzir efeitos de perfurações compatíveis e contribuir para maior durabilidade e eficiência operacional.</p>
            </div>
            <div className="grid-3">
              {[
                { icon: 'fa-shield-halved', title: 'Proteção contra perfurações', desc: 'O produto atua na região interna da banda de rodagem e é direcionado para perfurações compatíveis, ajudando a manter o pneu em operação.', tag: 'Proteção' },
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

        {/* TECHNOLOGY / PRODUCT ACTION */}
        <section id="tecnologia" className="section home-tech-section" aria-labelledby="home-tech-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Ação do produto no pneu</span>
              <h2 id="home-tech-title" className="section-title">Como o Flat Free atua</h2>
              <p className="section-description">
                O produto é aplicado diretamente no interior do pneu para criar uma camada preventiva de proteção na região interna da banda de rodagem, sem necessidade de desmontar a roda.
              </p>
            </div>

            {/* 4-step sequence: Aplicar -> Distribuir -> Atuar na perfuração -> Acompanhar */}
            <div className="home-tech-steps-grid">
              {[
                {
                  step: '01',
                  icon: 'fa-droplet',
                  title: 'Aplicar pela válvula',
                  desc: 'Injetado pela haste da válvula com o pneu montado na roda. Processo direto e limpo, sem necessidade de desmontagem da carcaça.',
                },
                {
                  step: '02',
                  icon: 'fa-arrows-spin',
                  title: 'Distribuir em rodagem',
                  desc: 'Com o giro e o rodar do veículo, o produto se distribui de maneira uniforme sobre a região interna da banda de rodagem.',
                },
                {
                  step: '03',
                  icon: 'fa-shield-halved',
                  title: 'Atuar na perfuração',
                  desc: 'Na ocorrência de uma perfuração compatível com a especificação, o produto é direcionado pela pressão para o ponto perfurado.',
                },
                {
                  step: '04',
                  icon: 'fa-gauge-high',
                  title: 'Manter a proteção em rodagem',
                  desc: 'Durante a rodagem, o produto permanece distribuído na região interna do pneu e disponível para atuar em novas perfurações compatíveis.',
                },
              ].map(item => (
                <div key={item.step} className="home-tech-step-card">
                  <div className="home-tech-step-top">
                    <span className="home-tech-step-num">{item.step}</span>
                    <div className="home-tech-step-icon">
                      <i className={`fas ${item.icon}`} aria-hidden="true" />
                    </div>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="home-tech-diagram-card" style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div className="home-tech-diagram-media">
                <Image
                  src="/images/tire_diagram_3d.jpg"
                  alt="Diagrama ilustrativo do corte transversal do pneu com camada interna protegida por Flat Free"
                  width={1000}
                  height={600}
                  sizes="(max-width: 900px) calc(100vw - 48px), 760px"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <div className="home-tech-diagram-caption">
                <span className="home-tech-caption-badge">Como atua no pneu</span>
                <p>Representação esquemática da distribuição do produto na região interna da banda de rodagem durante o uso.</p>
              </div>
            </div>

          </div>
        </section>

        {/* AUDIENCES */}
        <section id="caminhos" className="section home-audiences-section" aria-labelledby="home-audiences-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Próximo passo</span>
              <h2 id="home-audiences-title" className="section-title">Escolha como seguir com o Flat Free</h2>
              <p className="section-description">Escolha o caminho que corresponde ao seu uso. Cada página aprofunda somente o que faz sentido para aquele perfil.</p>
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
                  title: 'Instalar ou revender',
                  desc: 'Conheça o produto, a aplicação e como conversar com a Flat Free Brasil sobre fornecimento e parceria.',
                  href: '/parceiros',
                  cta: 'Ver para parceiros',
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

        {/* ARTICLES */}
        <section id="artigos" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Conteúdo e conhecimento</span>
              <h2 className="section-title">Entenda melhor pneus, aplicação e operação.</h2>
              <p className="section-description">Conteúdo para quem quer conhecer melhor perfurações, pressão, desgaste, aplicação do produto e gestão de pneus.</p>
            </div>
            <div style={{ maxWidth: '920px', margin: '0 auto' }}>
              <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img src="/images/hero_trucks_fleet.jpg" alt="Caminhões em operação de frota" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--color-safety-orange)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Operação &amp; prevenção</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <span><i className="far fa-clock" /> 5 min de leitura</span>
                    <span><i className="far fa-calendar-alt" /> Atualizado em 2026</span>
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '1.2rem' }}>Por que acompanhar pneus e ocorrências na operação</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>Perfurações, paradas, trocas e movimentações fazem parte da rotina de pneus. Registrar essas ocorrências junto com leituras e posições ajuda a construir um histórico útil para acompanhar a operação.</p>
                  <div className="article-subgrid">
                    {[
                      { icon: 'fa-wrench', title: 'Ocorrências', desc: 'Registre perfurações, intervenções e outros eventos relevantes ao longo do uso.' },
                      { icon: 'fa-ruler-vertical', title: 'Leituras', desc: 'Acompanhe sulco, quilometragem e outros dados registrados nas inspeções.' },
                      { icon: 'fa-route', title: 'Histórico', desc: 'Relacione veículo, posição, aplicações e movimentações de cada pneu.' },
                    ].map(b => (
                      <div key={b.title} style={{ background: 'var(--bg-surface-elevated)', borderRadius: '8px', padding: '1rem' }}>
                        <h5 style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}><i className={`fas ${b.icon}`} style={{ color: 'var(--color-safety-orange)', marginRight: '0.4rem' }} />{b.title}</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.25rem' }}>
                    <Link href="/conteudo/acompanhar-pneus-e-ocorrencias" className="btn btn-outline">
                      Ler conteúdo <i className="fas fa-arrow-right" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contato" className="section" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div className="container">
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div>
                <span className="section-tag">Fale com a Flat Free</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '1rem 0' }}>Produto, frota ou parceria: fale com a gente</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Use o formulário para conversar sobre aplicação em frotas, uso no seu veículo ou interesse em instalar e revender Flat Free.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', color: 'var(--text-secondary)', fontSize: '.9rem' }}>
                  <Link href="/meu-veiculo">Meu veículo <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                  <Link href="/frotas">Frotas e empresas <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                  <Link href="/parceiros">Instalar ou revender <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>Entrar em contato</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Como podemos atender você? *</label>
                    <select className="form-control" value={formData.perfil} onChange={e => setFormData(p => ({...p, perfil: e.target.value}))}>
                      <option value="frota">Empresa / frota</option>
                      <option value="particular">Meu veículo</option>
                      <option value="parceiro">Quero instalar ou revender</option>
                    </select>
                  </div>
                  <div className="contact-form-grid">
                    <div className="form-group">
                      <label className="form-label">Nome Completo *</label>
                      <input type="text" className="form-control" placeholder="Seu nome" required value={formData.nome} onChange={e => setFormData(p => ({...p, nome: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{formData.perfil === 'particular' ? 'Empresa (opcional)' : 'Empresa / estabelecimento *'}</label>
                      <input type="text" className="form-control" placeholder={formData.perfil === 'particular' ? 'Opcional' : 'Nome da empresa ou estabelecimento'} required={formData.perfil !== 'particular'} value={formData.empresa} onChange={e => setFormData(p => ({...p, empresa: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-mail *</label>
                      <input type="email" className="form-control" placeholder="seu@email.com" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                    </div>
                    {formData.perfil === 'frota' && (
                      <div className="form-group">
                        <label className="form-label">Tamanho da Frota</label>
                        <select className="form-control" value={formData.frota} onChange={e => setFormData(p => ({...p, frota: e.target.value}))}>
                          <option value="1-10">1 a 10 veículos</option>
                          <option value="11-50">11 a 50 veículos</option>
                          <option value="51-200">51 a 200 veículos</option>
                          <option value="200+">Mais de 200 veículos</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Como podemos ajudar?</label>
                    <textarea className="form-control" rows={4} placeholder={formData.perfil === 'parceiro' ? 'Conte sobre seu estabelecimento e interesse em instalar ou revender Flat Free...' : formData.perfil === 'particular' ? 'Conte qual veículo, medida dos pneus ou necessidade você quer atender...' : 'Conte sobre sua frota, veículos, pneus ou necessidade...'} value={formData.mensagem} onChange={e => setFormData(p => ({...p, mensagem: e.target.value}))} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={formState === 'sending'}>
                    {formState === 'sending' ? <><i className="fas fa-spinner fa-spin" /> Enviando...</> : <><i className="fas fa-paper-plane" /> Enviar Contato</>}
                  </button>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}><i className="fas fa-lock" /> Usaremos seus dados para responder ao seu contato e dar continuidade ao atendimento solicitado.</p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2.5rem', maxWidth: '420px', width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <i className="fas fa-circle-check" style={{ fontSize: '3rem', color: 'var(--color-industrial-lime)', marginBottom: '1rem', display: 'block' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Solicitação enviada com sucesso.</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Obrigado pelo contato. Os detalhes foram encaminhados à nossa equipe de atendimento.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(false)}>Concluir</button>
          </div>
        </div>
      )}

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
                {['Início:#inicio','Benefícios:#beneficios','Como atua:#tecnologia','Escolha seu caminho:#caminhos'].map(item => {
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
                <li><Link href="/solicitar" style={{ color: '#64748b', fontSize: '0.875rem' }}>Falar sobre Flat Free</Link></li>
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
