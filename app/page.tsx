'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import HomeNav from '@/components/HomeNav'

// ROI Calculator logic (from app.js)
function calcROI(fleetSize: number, monthlyKm: number, tireCost: number, vehicleType: string) {
  let tiresPerVehicle = 6
  let avgKmPerLiter = 2.5

  if (vehicleType === 'urban_vuc') { tiresPerVehicle = 6; avgKmPerLiter = 4.5 }
  else if (vehicleType === 'bus') { tiresPerVehicle = 6; avgKmPerLiter = 3.0 }
  else if (vehicleType === 'heavy_truck') { tiresPerVehicle = 10; avgKmPerLiter = 2.2 }
  else if (vehicleType === 'off_road') { tiresPerVehicle = 8; avgKmPerLiter = 1.5 }

  const dieselPrice = 6.20
  const annualFuel = fleetSize * (monthlyKm / avgKmPerLiter * dieselPrice * 12) * 0.038
  const annualTires = fleetSize * tiresPerVehicle * tireCost * 0.5 * 0.20
  const annualDowntime = fleetSize * 2 * 650
  const total = annualFuel + annualTires + annualDowntime
  const investment = fleetSize * tiresPerVehicle * 180
  const payback = (investment / (total / 12)).toFixed(1)
  return { fuel: annualFuel, tires: annualTires, downtime: annualDowntime, total, payback }
}

export default function HomePage() {
  // ROI Calculator state
  const [fleetSize, setFleetSize] = useState(20)
  const [mileage, setMileage] = useState(8000)
  const [tireCost, setTireCost] = useState(2200)
  const [vehicleType, setVehicleType] = useState('heavy_truck')
  const roi = calcROI(fleetSize, mileage, tireCost, vehicleType)

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
  const [simStatus, setSimStatus] = useState('Clique para simular furo de prego 6mm em tempo real.')

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
    ctx.fillText('CÂMARA DE AR INTERNA (PRESSÃO 110 PSI)',100,230)
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
        ctx.fillText('✓ VEDAÇÃO COMPACTA 6MM ATIVA',nailX-100,110)
      }
    }
  }, [])

  const animate = useCallback(() => {
    if (simStateRef.current === 'puncturing') {
      nailYRef.current += 4
      if (nailYRef.current >= 95) {
        simStateRef.current = 'sealing'
        setSimStatus('Selante Reagindo: Fibras e micro-polímeros fluindo para a perfuração...')
        setTimeout(() => {
          simStateRef.current = 'sealed'
          setSimStatus('✓ Perfuração Vedada Instantaneamente! Pressão mantida em 110 PSI.')
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
    setSimStatus('Perfurando pneu com prego de aço 6mm...')
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

  const fmt = (n: number) => Math.round(n).toLocaleString('pt-BR')

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
        <section id="inicio" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 55%, #1e1a0a 100%)', padding: '6rem 0 5rem' }}>
          <div className="container">
            <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,92,0,0.1)', border: '1px solid rgba(255,92,0,0.3)', borderRadius: '50px', padding: '0.35rem 0.9rem', color: 'var(--color-safety-orange)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <i className="fas fa-shield-halved" /> Produto + gestão de pneus
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.7rem)', fontWeight: 900, fontFamily: 'Montserrat, sans-serif', color: '#fff', lineHeight: 1.08, marginBottom: '1.25rem' }}>
                Proteção para o pneu. <span style={{ color: 'var(--color-safety-orange)' }}>Informação para prolongar sua vida útil.</span>
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: '0 auto 2rem', lineHeight: 1.7, maxWidth: '760px' }}>
                Flat Free combina proteção contra perfurações com ferramentas para acompanhar pneus, aplicações, posições, leituras e histórico. Para frotas, veículos particulares e uma futura rede de instalação e revenda.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/app" className="btn btn-primary btn-lg"><i className="fas fa-chart-line" /> Conhecer a plataforma</Link>
                <Link href="/calculadora" className="btn btn-secondary btn-lg"><i className="fas fa-calculator" /> Calcular dosagem</Link>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCES */}
        <section className="section" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Uma solução, diferentes necessidades</span>
              <h2 className="section-title">Como você quer usar o Flat Free?</h2>
              <p className="section-description">Escolha o caminho mais próximo da sua necessidade. A mesma solução conecta proteção, acompanhamento e serviço.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[
                {
                  icon: 'fa-truck',
                  title: 'Frotas e empresas',
                  desc: 'Cadastre veículos e pneus, acompanhe posições, aplicações, leituras, ocorrências e histórico para entender melhor o desgaste da frota.',
                  href: '/app',
                  cta: 'Gestão de pneus',
                },
                {
                  icon: 'fa-car-side',
                  title: 'Meu veículo',
                  desc: 'Entenda a aplicação do Flat Free no seu veículo, consulte a dosagem e prepare-se para localizar um ponto de instalação.',
                  href: '/calculadora',
                  cta: 'Consultar aplicação',
                },
                {
                  icon: 'fa-screwdriver-wrench',
                  title: 'Quero instalar ou revender',
                  desc: 'Oficinas, borracharias, concessionárias e prestadores poderão integrar a rede de atendimento e comercialização Flat Free.',
                  href: '#contato',
                  cta: 'Quero ser parceiro',
                },
              ].map(item => (
                <div key={item.title} className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '285px' }}>
                  <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,92,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <i className={`fas ${item.icon}`} style={{ color: 'var(--color-safety-orange)', fontSize: '1.2rem' }} />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.7rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', flex: 1 }}>{item.desc}</p>
                  <Link href={item.href} className="btn btn-outline" style={{ marginTop: '1.25rem', justifyContent: 'center' }}>
                    {item.cta} <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section className="section" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
              <div>
                <span className="section-tag">Flat Free Fleet</span>
                <h2 className="section-title" style={{ textAlign: 'left', marginTop: '0.8rem' }}>O pneu passa a ter histórico, não apenas cadastro.</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  A plataforma acompanha cada pneu ao longo da operação: em qual veículo e posição esteve, quando recebeu Flat Free, suas leituras, ocorrências e ciclos de recapagem. Essa base permite transformar manutenção em informação para decisão.
                </p>
                <Link href="/app" className="btn btn-primary"><i className="fas fa-gauge-high" /> Acessar gestão da frota</Link>
              </div>
              <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  ['fa-truck-moving', 'Veículos e posições'],
                  ['fa-circle-dot', 'Histórico por pneu'],
                  ['fa-ruler-vertical', 'Leituras de desgaste'],
                  ['fa-route', 'Movimentações'],
                  ['fa-droplet', 'Aplicações Flat Free'],
                  ['fa-rotate', 'Ciclos e recapagens'],
                ].map(([icon, label]) => (
                  <div key={label} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-surface)' }}>
                    <i className={`fas ${icon}`} style={{ color: 'var(--color-safety-orange)', marginBottom: '0.6rem' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</div>
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
              <span className="section-tag">Ação Polimérica em Tempo Real</span>
              <h2 className="section-title">Como Funciona a Tecnologia Flat Free</h2>
              <p className="section-description">O selante é aplicado diretamente pela válvula do pneu. Através da força centrífuga, cria uma película protetora uniforme na área interna da banda de rodagem.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', marginBottom: '3rem' }}>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src="/images/tire_diagram_3d.jpg" alt="Diagrama 3D Corte Transversal Pneu com Selante Flat Free" style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { n: 1, title: 'Aplicação Direta sem Desmontar', desc: 'Injetado pela válvula com o pneu montado na roda. Rápido, sem necessidade de parar a oficina por longos períodos.' },
                  { n: 2, title: 'Revestimento por Força Centrífuga', desc: 'Com o rodar do veículo, o fluido cobre homogeneamente a camada interna de borracha, criando uma barreira contínua.' },
                  { n: 3, title: 'Vedação Instantânea até 6mm', desc: 'Em caso de furo por prego ou parafuso, a pressão força as microfibras sintéticas para o orifício, selando-o instantaneamente.' },
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
            <div style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e293b)', borderRadius: '16px', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>Simulador Interativo de Perfuração</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Veja a física em tempo real: simule a penetração de um objeto perfurante (prego de aço 6mm) e observe a ação imediata do gel protetor.</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button className="btn btn-primary" onClick={startSim}><i className="fas fa-play" /> Simular Furo de Prego 6mm</button>
                  <button className="btn btn-outline" onClick={resetSim} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}><i className="fas fa-rotate" /> Reiniciar</button>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{simStatus}</p>
              </div>
              <div style={{ background: '#0f172a', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <canvas ref={canvasRef} width={460} height={260} style={{ width: '100%', display: 'block' }} />
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}><i className="fas fa-info-circle" /> Renderização do perfil transversal do pneu tratado com Flat Free</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
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

        {/* ROI CALCULATOR */}
        <section id="calculadora" className="section" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Planejamento para frotas</span>
              <h2 className="section-title">Simulação operacional da frota</h2>
              <p className="section-description">Use os parâmetros abaixo como uma simulação inicial. Resultados reais dependem da operação, dos pneus, das rotas, da manutenção e dos dados medidos em cada frota.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <div className="form-group">
                  <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tamanho da Frota</span>
                    <span style={{ color: 'var(--color-safety-orange)', fontWeight: 700 }}>{fleetSize} veículos</span>
                  </div>
                  <input type="range" min={5} max={300} step={5} value={fleetSize} onChange={e => setFleetSize(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Veículo Dominante</label>
                  <select className="form-control" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                    <option value="heavy_truck">Caminhão Pesado (6x4 / Bitrem)</option>
                    <option value="urban_vuc">Caminhão Urbano / VUC</option>
                    <option value="bus">Ônibus Rodoviário / Urbano</option>
                    <option value="off_road">Máquinas Industriais / Off-Road</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Quilometragem Média Mensal / Veículo</span>
                    <span style={{ color: 'var(--color-safety-orange)', fontWeight: 700 }}>{mileage.toLocaleString('pt-BR')} km/mês</span>
                  </div>
                  <input type="range" min={1000} max={25000} step={500} value={mileage} onChange={e => setMileage(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Custo Médio de Pneu Novo</span>
                    <span style={{ color: 'var(--color-safety-orange)', fontWeight: 700 }}>R$ {tireCost.toLocaleString('pt-BR')}</span>
                  </div>
                  <input type="range" min={800} max={4500} step={100} value={tireCost} onChange={e => setTireCost(+e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Resultado do Retorno Financeiro</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Cenário estimativo para planejamento. Não representa garantia de economia ou desempenho.</p>
                <div style={{ background: 'linear-gradient(135deg, var(--color-safety-orange), #ff8c42)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Economia Total Estimada Anual</div>
                  <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Montserrat' }}>R$ {fmt(roi.total)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Economia Estimada em Combustível:', val: `R$ ${fmt(roi.fuel)}` },
                    { label: 'Economia em Substituição de Pneus:', val: `R$ ${fmt(roi.tires)}` },
                    { label: 'Redução em Manutenção/Socorro:', val: `R$ ${fmt(roi.downtime)}` },
                    { label: 'Tempo de Payback do Investimento:', val: `${roi.payback} meses`, highlight: true },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.highlight ? 'var(--color-industrial-lime)' : undefined }}>{row.val}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/solicitar`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-file-export" /> Solicitar Flat Free para Minha Frota
                </Link>
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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img src="/images/hero_trucks_fleet.jpg" alt="Custo Oculto do Pneu Furado na Logística B2B" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--color-safety-orange)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>Logística &amp; Performance</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <span><i className="far fa-clock" /> 5 min de leitura</span>
                    <span><i className="far fa-calendar-alt" /> Atualizado em 2026</span>
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '1.2rem' }}>O Custo Oculto do Pneu Furado na Logística B2B</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>Na engenharia logística moderna, a precisão é a métrica principal. No entanto, um componente analógico frequentemente desestabiliza a cadeia: o pneu. Um único furo em transporte pesado desencadeia um efeito cascata de perdas financeiras.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                      { icon: 'fa-wrench', title: 'Custos Diretos', desc: 'Socorro mecânico e substituição prematura da carcaça comprometida.' },
                      { icon: 'fa-clock', title: 'Custos Indiretos', desc: 'Multas contratuais por atraso e horas ociosas de motoristas.' },
                      { icon: 'fa-chart-line', title: 'Oportunidade', desc: 'Perda de SLAs estratégicos e reputação perante clientes corporativos.' },
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
                <img src="/images/flat_free_product.jpg" alt="Balde Flat Free B2B" style={{ borderRadius: '8px', width: '100%', height: '160px', objectFit: 'cover' }} />
                <h4 style={{ fontWeight: 700 }}>Flat Free B2B Industrial</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Embalagem corporativa projetada para atendimento em grande escala para frotistas e concessionárias.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Consulte a dosagem pela medida do pneu ou fale com a equipe para confirmar a aplicação adequada ao seu uso.</p>
                <Link href="/calculadora" className="btn btn-outline" style={{ justifyContent: 'center' }}><i className="fas fa-calculator" /> Consultar Dosagem</Link>
              </aside>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contato" className="section" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}><i className="fas fa-lock" /> Seus dados estão seguros e protegidos em conformidade com a LGPD.</p>
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Obrigado pelo contato. Os detalhes foram encaminhados ao nosso time de especialistas.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(false)}>Concluir</button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1e', color: '#fff', padding: '3rem 0 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.75rem' }}>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>Engenharia e tecnologia avançada em selantes de pneus para frotas comerciais, agrícolas e industriais de alta exigência.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Navegação</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Início:#inicio','Tecnologia 3D:#tecnologia','Benefícios:#beneficios','Calculadora ROI:#calculadora'].map(item => {
                  const [label, href] = item.split(':')
                  return <li key={href}><a href={href} style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</a></li>
                })}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Recursos B2B</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/calculadora" style={{ color: '#64748b', fontSize: '0.875rem' }}>Calcular Dosagem</Link></li>
                <li><Link href="/solicitar" style={{ color: '#64748b', fontSize: '0.875rem' }}>Solicitar Flat Free</Link></li>
                <li><Link href="/app" style={{ color: '#64748b', fontSize: '0.875rem' }}>Acessar Plataforma</Link></li>
                <li><a href="#contato" style={{ color: '#64748b', fontSize: '0.875rem' }}>Solicitar Demonstração</a></li>
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
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>© 2026 FLAT FREE B2B Tire Sealant - Todos os direitos reservados.</span>
            <span>Desenvolvido com excelência em engenharia industrial B2B.</span>
          </div>
        </div>
      </footer>
    </>
  )
}