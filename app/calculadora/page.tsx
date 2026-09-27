'use client'
import { useState } from 'react'
import Link from 'next/link'
import { DOSAGE_TABLE, getDosageOz, ozToLiters, ozToBucketsFractional, ozToBucketsCeil } from '@/lib/dosage'

interface CalcLine {
  id: number
  medida: string
  quantidade: number
}

interface CalcResult {
  medida: string
  quantidade: number
  ozPerTire: number | null
  totalOz: number
}

export default function CalculadoraPage() {
  const [lines, setLines] = useState<CalcLine[]>([
    { id: 1, medida: '295/80 R22,5', quantidade: 10 },
  ])

  function addLine() {
    setLines(prev => [...prev, { id: Date.now(), medida: '295/80 R22,5', quantidade: 1 }])
  }

  function removeLine(id: number) {
    if (lines.length === 1) return
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function updateLine(id: number, field: keyof Omit<CalcLine, 'id'>, value: string | number) {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const results: CalcResult[] = lines.map(line => {
    const oz = getDosageOz(line.medida)
    return {
      medida: line.medida,
      quantidade: line.quantidade,
      ozPerTire: oz,
      totalOz: oz ? oz * line.quantidade : 0,
    }
  })

  const totalOz = results.reduce((sum, r) => sum + r.totalOz, 0)
  const hasUnknown = results.some(r => r.ozPerTire === null)

  // Encode calc items for /solicitar URL
  const calcParams = encodeURIComponent(JSON.stringify(
    lines.map(l => ({
      medida: l.medida,
      quantidade: l.quantidade,
      doseUnitOz: getDosageOz(l.medida),
      totalOz: (getDosageOz(l.medida) ?? 0) * l.quantidade,
    }))
  ))

  return (
    <>
      <header style={{ background: '#0a0f1e', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Montserrat', fontWeight: 900, color: '#fff', fontSize: '1.1rem' }}>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></Link>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>← Início</Link>
            <Link href="/solicitar" className="btn btn-primary btn-sm">Solicitar Produto</Link>
          </nav>
        </div>
      </header>

      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag">Ferramenta Técnica</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Montserrat', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Calculadora de Dosagem</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Calcule a quantidade exata de Flat Free para os pneus que pretende tratar. Adicione quantas medidas precisar.</p>
          </div>

          {/* Lines */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>Pneus a tratar</h3>
              <button className="btn btn-outline btn-sm" onClick={addLine}><i className="fas fa-plus" /> Adicionar medida</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medida do Pneu</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qtd. Pneus</span>
                <span />
              </div>
              {lines.map(line => (
                <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.75rem', alignItems: 'center' }}>
                  <select
                    className="form-control"
                    value={line.medida}
                    onChange={e => updateLine(line.id, 'medida', e.target.value)}
                  >
                    {DOSAGE_TABLE.map(d => <option key={d.measure} value={d.measure}>{d.measure}</option>)}
                    <option value="outro">Outra medida — Consultar dosagem</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    className="form-control"
                    value={line.quantidade}
                    onChange={e => updateLine(line.id, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length === 1}
                    style={{
                      background: 'none', border: 'none',
                      cursor: lines.length > 1 ? 'pointer' : 'not-allowed',
                      color: lines.length > 1 ? '#ef4444' : 'var(--text-muted)',
                      padding: '0.5rem',
                    }}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Resultado</h3>
            <table className="table" style={{ marginBottom: '1.25rem' }}>
              <thead>
                <tr>
                  <th>Medida</th>
                  <th>Qtd. Pneus</th>
                  <th>Por Pneu</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.medida}</td>
                    <td>{r.quantidade}</td>
                    <td>
                      {r.ozPerTire !== null
                        ? <span className="badge badge-blue">{r.ozPerTire} oz</span>
                        : <span className="badge badge-orange">Consultar dosagem</span>}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {r.ozPerTire !== null ? `${r.totalOz} oz` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalOz > 0 && (
              <div style={{ background: 'rgba(255,92,0,0.05)', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(255,92,0,0.15)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Montserrat', color: 'var(--color-safety-orange)' }}>{totalOz}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total (fl oz)</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Montserrat', color: 'var(--color-safety-orange)' }}>{ozToLiters(totalOz).toFixed(1)} L</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Equivalente litros</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Montserrat', color: 'var(--color-safety-orange)' }}>≈ {ozToBucketsFractional(totalOz).toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baldes (exato)</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,92,0,0.1)', borderRadius: '8px', padding: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Montserrat', color: 'var(--color-safety-orange)' }}>{ozToBucketsCeil(totalOz)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baldes p/ pedir</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                  Balde: 5 gal US (640 fl oz ≈ 18,9 L). Baldes para pedido arredondados para cima.
                </p>
              </div>
            )}

            {hasUnknown && (
              <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.75rem', fontSize: '0.875rem', color: '#ea580c' }}>
                <i className="fas fa-info-circle" /> Algumas medidas precisam de consulta técnica. Prossiga e detalhe sua necessidade na solicitação.
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e293b)', border: 'none', textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>Pronto para solicitar?</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Os itens calculados serão transferidos automaticamente para o formulário de solicitação.</p>
            <Link
              href={`/solicitar?calc=${calcParams}`}
              className="btn btn-primary btn-lg"
            >
              <i className="fas fa-arrow-right" /> Solicitar Flat Free para esta aplicação
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
