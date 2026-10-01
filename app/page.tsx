'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HomeNav from '@/components/HomeNav'

export default function HomePage() {
  // Contact form
  const [formState, setFormState] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ perfil: 'frota', nome: '', empresa: '', email: '', frota: '11-50', mensagem: '' })

  // Puncture simulator
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simStateRef = useRef<'idle'|'puncturing'|'sealing'|'sealed'>('idle')
  const animRef = useRef<number>(0)
  const nailYRef = useRef(-40)
  const sealantPulseRef = useRef(0)
  const [simStatus, setSimStatus] = useState('Clique para visualizar, de forma ilustrativa, a sequência de uma perfuração.')

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke() }
    for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }
    // Outer rubber
    ctx.fillStyle = '#1e293b'; ctx.fillRect(40,140,w-80,50)
    // Steel belts
    ctx.fillStyle = '#475569'; ctx.fillRect(40,175,w-80,10)
    ctx.fillStyle = '#ff5c00'
    for (let i = 50; i < w-50; i += 20) { ctx.fillRect(i,177,10,6) }
    // Sealant layer
    ctx.fillStyle = 'rgba(0,150,255,0.75)'; ctx.fillRect(45,185,w-90,18)
    // Air chamber
    ctx.fillStyle = '#0f172a'; ctx.fillRect(45,203,w-90,45)
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter'
    ctx.fillText('REGIÃO INTERNA DO PNEU',100,230)
    // Particles
    ctx.fillStyle = '#60a5fa'
    for (let i = 0; i < 15; i++) {
      const px = 60 + i*25 + Math.sin(Date.now()*0.003+i)*5
      ctx.beginPath(); ctx.arc(px,194,3,0,Math.PI*2); ctx.fill()
    }
    // Nail and effects
    const state = simStateRef.current
    if (state !== 'idle') {
      const nailX = w/2, nailY = nailYRef.current
      ctx.fillStyle = '#94a3b8'
      ctx.beginPath(); ctx.moveTo(nailX-6,nailY); ctx.lineTo(nailX+6,nailY)
      ctx.lineTo(nailX+3,nailY+90); ctx.lineTo(nailX-3,nailY+90); ctx.closePath(); ctx.fill()
      if (nailY > 80) { ctx.fillStyle = '#ef4444'; ctx.fillRect(nailX-4,140,8,50) }
      if (state === 'puncturing') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.beginPath(); ctx.arc(nailX-10,130-Math.random()*20,4,0,Math.PI*2)
        ctx.arc(nailX+12,120-Math.random()*20,5,0,Math.PI*2); ctx.fill()
      }
      if (state === 'sealing' || state === 'sealed') {
        sealantPulseRef.current += 0.05
        const r = Math.min(18, 8 + Math.sin(sealantPulseRef.current)*4)
        ctx.fillStyle = '#009668'; ctx.beginPath(); ctx.arc(nailX,175,r,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = '#34d399'; ctx.font = 'bold 12px Inter'
        ctx.fillText('REPRESENTAÇÃO DA VEDAÇÃO',nailX-100,110)
      }
    }
  }, [])

  const animate = useCallback(() => {
    if (simStateRef.current === 'puncturing') {
      nailYRef.current += 4
      if (nailYRef.current >= 95) {
        simStateRef.current = 'sealing'
        setSimStatus('Representação ilustrativa: produto direcionado para a região da perfuração...')
        setTimeout(() => {
          simStateRef.current = 'sealed'
          setSimStatus('Sequência ilustrativa concluída. Consulte a especificação técnica para limites de aplicação e desempenho.')
        }, 1200)
      }
    }
    drawCanvas()
    animRef.current = requestAnimationFrame(animate)
  }, [drawCanvas])

  useEffect(() => {
    drawCanvas()
    return () => cancelAnimationFrame(animRef.current)
  }, [drawCanvas])

  function startSim() {
    if (simStateRef.current !== 'idle') return
    simStateRef.current = 'puncturing'
    nailYRef.current = 0
    setSimStatus('Representando a entrada de um objeto perfurante...')
    cancelAnimationFrame(animRef.current)
    animate()
  }

  function resetSim() {
    simStateRef.current = 'idle'
    nailYRef.current = -40
    setSimStatus('Clique para simular furo de prego 6mm em tempo real.')
    cancelAnimationFrame(animRef.current)
    drawCanvas()
  }

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
      <HomeNav />
      <main>
        {/* HERO */}
        <section id="inicio" className="home-product-hero" aria-labelledby="home-hero-title">
          <div className="container home-product-hero-grid">
            <div className="home-product-hero-copy">
              <span className="home-product-hero-eyebrow">Flat Free Brasil · Produto para pneus</span>
              <h1 id="home-hero-title">A proteção começa <span>no pneu.</span></h1>
              <p className="home-product-hero-description">
                Conheça Flat Free, o produto aplicado no interior dos pneus. Consulte a aplicação para seu veículo ou sua frota e fale com nossa equipe sobre atendimento, instalação ou revenda.
              </p>
              <div className="home-product-hero-actions">
                <Link href="/solicitar" className="btn btn-primary btn-lg">Quero Flat Free <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                <Link href="/calculadora" className="btn btn-secondary btn-lg"><i className="fas fa-calculator" aria-hidden="true" /> Calcular aplicação</Link>
              </div>
              <div className="home-product-hero-fleet">
                <p>Tem uma frota? Acompanhe aplicações e o histórico dos pneus na plataforma Flat Free.</p>
                <Link href="/app">Gestão para frotas <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              </div>
            </div>
            <figure className="home-product-hero-visual">
              <Image src="/images/flat-free-product-hero.png" alt="Apresentação comercial do balde azul Flat Free com bomba e mangueira de aplicação, ao lado da identidade da marca." width={1536} height={1024} sizes="(max-width: 900px) calc(100vw - 48px), (max-width: 1280px) 55vw, 660px" priority />
              <figcaption><span>Balde azul · 5 US gal / 18,9 L</span><span>Apresentação ilustrativa com equipamento de aplicação</span></figcaption>
            </figure>
          </div>
        </section>

        {/* AUDIENCES */}
        <section className="section home-audiences-section" aria-labelledby="home-audiences-title">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Uma solução, diferentes necessidades</span>
              <h2 id="home-audiences-title" className="section-title">Como você quer usar o Flat Free?</h2>
              <p className="section-description">Escolha o caminho mais próximo da sua necessidade. A mesma solução conecta proteção, acompanhamento e serviço.</p>
            </div>
            <div className="home-audiences-grid">
              {[
                {
                  badge: 'Aplicação direta',
                  icon: 'fa-car-side',
                  title: 'Meu veículo',
                  desc: 'Entenda a aplicação do Flat Free no seu veículo, consulte a dosagem recomendada para as medidas dos pneus e prepare-se para solicitar o produto.',
                  href: '/calculadora',
                  cta: 'Calcular aplicação',
                  isPrimary: true,
                },
                {
                  badge: 'Gestão e histórico',
                  icon: 'fa-truck',
                  title: 'Frotas e empresas',
                  desc: 'Cadastre veículos e pneus, acompanhe posições, aplicações, leituras, ocorrências e histórico operacional para entender o ciclo de vida dos pneus.',
                  href: '/app',
                  cta: 'Gestão de frotas',
                  isPrimary: false,
                },
                {
                  badge: 'Rede de atendimento',
                  icon: 'fa-screwdriver-wrench',
                  title: 'Instalar ou revender',
                  desc: 'Oficinas, borracharias, concessionárias e prestadores de serviço podem integrar a rede de aplicação e comercialização Flat Free.',
                  href: '#contato',
                  cta: 'Quero ser parceiro',
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

        {/* PLATFORM / FLEET LIFECYCLE BRIDGE */}
        <section className="section home-fleet-section" aria-labelledby="home-fleet-title">
          <div className="container">
            <div className="home-fleet-header">
              <span className="section-tag">Flat Free Fleet · Gestão &amp; Histórico</span>
              <h2 id="home-fleet-title" className="section-title">O pneu passa a ter histórico, não apenas cadastro.</h2>
              <p className="section-description">
                A plataforma conecta a aplicação física do Flat Free ao acompanhamento contínuo de cada pneu da frota. Em vez de uma planilha isolada, cada etapa da operação fica registrada no ciclo de vida do pneu.
              </p>
            </div>

            <div className="home-fleet-cycle-container">
              <div className="home-fleet-cycle-intro">
                <span className="home-fleet-cycle-eyebrow">Ciclo operacional integrado</span>
                <h3>Como o produto e a gestão trabalham juntos</h3>
                <p>
                  Do momento em que o pneu entra em operação até suas recapagens, a plataforma registra aplicações de Flat Free, posições no veículo, leituras de sulco e ocorrências em uma linha do tempo única.
                </p>
                <div className="home-fleet-actions">
                  <Link href="/app" className="btn btn-primary">
                    <i className="fas fa-gauge-high" aria-hidden="true" /> Conhecer a gestão da frota
                  </Link>
                  <Link href="/app/pneus" className="btn btn-outline">
                    Ver acompanhamento por pneu <i className="fas fa-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="home-fleet-steps-flow">
                {[
                  {
                    step: '01',
                    icon: 'fa-circle-plus',
                    title: 'Cadastrar',
                    desc: 'Registro do pneu com marca, modelo, medida, número de fogo e condição inicial (novo ou recapado).',
                  },
                  {
                    step: '02',
                    icon: 'fa-droplet',
                    title: 'Aplicar Flat Free',
                    desc: 'Registro da dose aplicada pela válvula, lote, data, quilometragem e sulco inicial no momento da proteção.',
                  },
                  {
                    step: '03',
                    icon: 'fa-truck-moving',
                    title: 'Posicionar',
                    desc: 'Vinculação ao veículo e eixo (simples ou duplo), com histórico de montagem e movimentações de rodízio.',
                  },
                  {
                    step: '04',
                    icon: 'fa-ruler-vertical',
                    title: 'Medir e inspecionar',
                    desc: 'Leituras periódicas de sulco e pressão para acompanhar a evolução do desgaste ao longo da quilometragem.',
                  },
                  {
                    step: '05',
                    icon: 'fa-triangle-exclamation',
                    title: 'Registrar ocorrências',
                    desc: 'Apontamento de perfurações atendidas, reparos, perdas de pressão, retiradas ou envio para recapagem.',
                  },
                  {
                    step: '06',
                    icon: 'fa-timeline',
                    title: 'Acompanhar histórico',
                    desc: 'Linha do tempo consolidada relacionando veículos, posições, aplicações de produto e ciclos de vida do pneu.',
                  },
                ].map((item, idx) => (
                  <div key={item.step} className="home-fleet-step-card">
                    <div className="home-fleet-step-header">
                      <span className="home-fleet-step-number">{item.step}</span>
                      <div className="home-fleet-step-icon">
                        <i className={`fas ${item.icon}`} aria-hidden="true" />
                      </div>
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    {idx < 5 && <div className="home-fleet-step-connector" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY */}
        <section id="tecnologia" className="section tech-section" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Como o produto atua</span>
              <h2 className="section-title">Como Funciona a Tecnologia Flat Free</h2>
              <p className="section-description">O selante é aplicado diretamente pela válvula do pneu. Através da força centrífuga, cria uma película protetora uniforme na área interna da banda de rodagem.</p>
            </div>
            <div className="grid-2" style={{ alignItems: 'start', marginBottom: '3rem' }}>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src="/images/tire_diagram_3d.jpg" alt="Diagrama 3D Corte Transversal Pneu com Selante Flat Free" style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { n: 1, title: 'Aplicação Direta sem Desmontar', desc: 'Injetado pela válvula com o pneu montado na roda. Rápido, sem necessidade de parar a oficina por longos períodos.' },
                  { n: 2, title: 'Revestimento por Força Centrífuga', desc: 'Com o rodar do veículo, o fluido cobre homogeneamente a camada interna de borracha, criando uma barreira contínua.' },
                  { n: 3, title: 'Ação na região da perfuração', desc: 'Em uma perfuração compatível com a especificação do produto, o Flat Free é direcionado para a região afetada. Os limites técnicos devem seguir a documentação oficial.' },
                  { n: 4, title: 'Produto em circulação no pneu', desc: 'O produto permanece distribuído na região interna de rodagem durante o uso. Características técnicas e compatibilidades devem seguir a documentação oficial do produto.' },
                ].map(step => (
                  <div key={step.n} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '2rem', height: '2rem', background: 'var(--color-safety-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>{step.n}</div>
                    <div><h4 style={{ fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.95rem' }}>{step.title}</h4><p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{step.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulator */}
            <div className="home-simulator-grid">
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>Visualização ilustrativa de perfuração</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>A animação abaixo ajuda a visualizar o conceito de funcionamento do produto. Ela não representa um ensaio técnico, medição de pressão ou comprovação de desempenho.</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={startSim}><i className="fas fa-play" /> Iniciar visualização</button>
                  <button className="btn btn-outline" onClick={resetSim} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}><i className="fas fa-rotate" /> Reiniciar</button>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{simStatus}</p>
              </div>
              <div style={{ background: '#0f172a', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <canvas ref={canvasRef} width={460} height={260} style={{ width: '100%', display: 'block' }} />
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}><i className="fas fa-info-circle" /> Ilustração conceitual do perfil transversal de um pneu com Flat Free</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section id="beneficios" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Proteção &amp; acompanhamento</span>
              <h2 className="section-title">Produto e gestão trabalhando juntos</h2>
              <p className="section-description">A proteção contra perfurações se soma ao acompanhamento de pressão, desgaste, posição e histórico do pneu ao longo da operação.</p>
            </div>
            <div className="grid-3">
              {[
                { icon: 'fa-gauge-high', title: 'Pressão e condição sob acompanhamento', desc: 'Registre leituras ao longo da operação e mantenha o histórico do pneu disponível para apoiar inspeções e decisões de manutenção.', tag: 'Histórico operacional' },
                { icon: 'fa-ruler-vertical', title: 'Desgaste acompanhado por leitura', desc: 'Sulco, quilometragem, posição e movimentações formam uma linha do tempo que ajuda a entender como cada pneu está sendo utilizado.', tag: 'Gestão de desgaste' },
                { icon: 'fa-shield-halved', title: 'Proteção contra perfurações', desc: 'Flat Free atua como proteção preventiva contra perfurações compatíveis com sua especificação, enquanto a plataforma registra a aplicação e acompanha o pneu tratado.', tag: 'Produto + plataforma' },
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

        {/* APPLICATION CTA */}
        <section id="calculadora" className="section" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Aplicação Flat Free</span>
              <h2 className="section-title">Comece pela medida do pneu</h2>
              <p className="section-description">Use a calculadora de dosagem para consultar a quantidade de referência por pneu. Depois, você pode levar os itens calculados diretamente para a solicitação de atendimento.</p>
            </div>
            <div className="card" style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/calculadora" className="btn btn-primary btn-lg"><i className="fas fa-calculator" /> Calcular dosagem</Link>
                <Link href="/solicitar" className="btn btn-outline btn-lg"><i className="fas fa-paper-plane" /> Falar com a Flat Free</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ARTICLES */}
        <section id="artigos" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Conteúdo e conhecimento</span>
              <h2 className="section-title">Gestão de pneus na prática</h2>
              <p className="section-description">Conteúdo para apoiar frotistas, instaladores e usuários na aplicação do produto e no acompanhamento dos pneus.</p>
            </div>
            <div className="public-content-grid">
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
                </div>
              </article>
              <aside className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <img src="/images/flat_free_product.jpg" alt="Embalagem do produto Flat Free" style={{ borderRadius: '8px', width: '100%', height: '160px', objectFit: 'cover' }} />
                <h4 style={{ fontWeight: 700 }}>Flat Free</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Consulte a aplicação conforme a medida do pneu e a necessidade do veículo ou da frota.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Consulte a dosagem pela medida do pneu ou fale com a equipe para confirmar a aplicação adequada ao seu uso.</p>
                <Link href="/calculadora" className="btn btn-outline" style={{ justifyContent: 'center' }}><i className="fas fa-calculator" /> Consultar Dosagem</Link>
              </aside>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { icon: 'fa-user-gear', title: 'Orientação de aplicação', desc: 'Atendimento para entender veículos, medidas de pneus, quantidade necessária e forma de uso.' },
                    { icon: 'fa-chart-line', title: 'Gestão para frotas', desc: 'Ferramentas para registrar pneus, posições, aplicações, leituras, ocorrências e histórico operacional.' },
                    { icon: 'fa-screwdriver-wrench', title: 'Instalação e parceria', desc: 'Canal para oficinas, borracharias, concessionárias e prestadores interessados em instalar ou revender Flat Free.' },
                  ].map(c => (
                    <div key={c.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', background: 'rgba(255,92,0,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fas ${c.icon}`} style={{ color: 'var(--color-safety-orange)' }} />
                      </div>
                      <div><h4 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{c.title}</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.desc}</p></div>
                    </div>
                  ))}
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
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>Proteção contra perfurações e ferramentas para acompanhar aplicações, posições, leituras e histórico dos pneus.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Navegação</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Início:#inicio','Como funciona:#tecnologia','Benefícios:#beneficios','Calcular aplicação:#calculadora'].map(item => {
                  const [label, href] = item.split(':')
                  return <li key={href}><a href={href} style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</a></li>
                })}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Flat Free</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/calculadora" style={{ color: '#64748b', fontSize: '0.875rem' }}>Calcular Dosagem</Link></li>
                <li><Link href="/solicitar" style={{ color: '#64748b', fontSize: '0.875rem' }}>Solicitar Flat Free</Link></li>
                <li><Link href="/app" style={{ color: '#64748b', fontSize: '0.875rem' }}>Acessar Plataforma</Link></li>
                <li><a href="#contato" style={{ color: '#64748b', fontSize: '0.875rem' }}>Conhecer gestão da frota</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Atendimento</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/calculadora" style={{ color: '#64748b', fontSize: '0.875rem' }}>Consultar aplicação</Link></li>
                <li><Link href="/solicitar" style={{ color: '#64748b', fontSize: '0.875rem' }}>Falar sobre Flat Free</Link></li>
                <li><a href="#contato" style={{ color: '#64748b', fontSize: '0.875rem' }}>Quero ser parceiro</a></li>
              </ul>
            </div>
          </div>
          <div className="public-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>© 2026 Flat Free Brasil - Todos os direitos reservados.</span>
            <span>Proteção e gestão de pneus.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
