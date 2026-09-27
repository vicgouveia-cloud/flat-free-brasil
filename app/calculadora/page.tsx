'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  DOSAGE_CATALOG,
  resolveDosageForApplication,
  ozToLiters,
  ozToBucketsFractional,
  ozToBucketsCeil,
  calculateDoseFromFormula,
  formatDoseValue,
  formatDoses,
  VEHICLE_USAGE_LABELS,
  type VehicleUsageClass,
} from '@/lib/dosage'

interface CalcLine {
  id: number
  medida: string
  quantidade: number
  usageClass?: VehicleUsageClass
}

export default function CalculadoraPage() {
  const [lines, setLines] = useState<CalcLine[]>([
    { id: 1, medida: '295/80 R22,5', quantidade: 10 },
  ])

  // Technical mode state (ASI physical formula)
  const [techHeight, setTechHeight] = useState<number>(41)
  const [techTread, setTechTread] = useState<number>(10)
  const [techSpeed, setTechSpeed] = useState<'over_45_mph' | 'under_45_mph'>('over_45_mph')
  const [techWorn, setTechWorn] = useState<boolean>(false)

  function addLine() {
    setLines(prev => [...prev, { id: Date.now(), medida: '', quantidade: 1 }])
  }

  function removeLine(id: number) {
    if (lines.length === 1) return
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function updateLine(
    id: number,
    field: keyof Omit<CalcLine, 'id'>,
    value: string | number | VehicleUsageClass
  ) {
    setLines(prev =>
      prev.map(l => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        // Se a medida informada possui dose confirmada na tabela ou classificação automática segura,
        // limpa a escolha manual de usageClass
        if (field === 'medida') {
          const res = resolveDosageForApplication(String(value))
          if (res.status === 'resolved' && (res.source === 'table' || res.catalogEntry)) {
            delete updated.usageClass
          }
        }
        return updated
      })
    )
  }

  // Resolução linha a linha
  const evaluatedLines = lines.map(line => {
    const resolution = resolveDosageForApplication(line.medida, line.usageClass)

    // O seletor de classe deve ser exibido quando:
    // - a medida métrica precisa da seleção da classe de uso (needs_usage_class)
    // - ou a medida métrica fora do catálogo já foi resolvida por seleção manual do usuário
    const showUsageSelector =
      (resolution.status === 'requires_review' && resolution.reason === 'needs_usage_class') ||
      (resolution.status === 'resolved' && resolution.source === 'estimated' && !resolution.catalogEntry)

    const appliedDose = resolution.status === 'resolved' ? resolution.appliedDose : null
    const lineTotalDoses = appliedDose !== null ? appliedDose * line.quantidade : 0

    return {
      line,
      resolution,
      showUsageSelector,
      appliedDose,
      lineTotalDoses,
    }
  })

  // Totais
  const resolvedLines = evaluatedLines.filter(item => item.resolution.status === 'resolved')
  const unresolvedLines = evaluatedLines.filter(item => item.resolution.status === 'requires_review')
  const totalDoses = resolvedLines.reduce((sum, item) => sum + item.lineTotalDoses, 0)
  const hasUnresolved = unresolvedLines.length > 0
  const hasEmpirical = resolvedLines.some(
    item => item.resolution.status === 'resolved' && item.resolution.source === 'estimated'
  )

  const totalsTitle = hasUnresolved
    ? 'Consumo Total Parcial'
    : hasEmpirical
    ? 'Consumo Total Estimado'
    : 'Consumo Total Tabelado'

  const unresolvedCount = unresolvedLines.length
  const unresolvedMsg =
    unresolvedCount === 1
      ? '1 medida ainda precisa de confirmação técnica e não foi somada aos totais abaixo.'
      : `${unresolvedCount} medidas ainda precisam de confirmação técnica e não foram somadas aos totais abaixo.`

  // Cálculo da fórmula física ASI no modo técnico
  const techResult = calculateDoseFromFormula({
    tireHeightInches: techHeight,
    treadWidthInches: techTread,
    speedRegime: techSpeed,
    isOldOrExtremelyWorn: techWorn,
  })

  // Encode calc items para a rota /solicitar
  const calcParams = encodeURIComponent(
    JSON.stringify(
      evaluatedLines.map(item => ({
        medida: item.line.medida,
        quantidade: item.line.quantidade,
        doseUnitOz: item.appliedDose,
        totalOz: item.lineTotalDoses,
      }))
    )
  )

  return (
    <>
      <header
        style={{
          background: '#0a0f1e',
          padding: '1rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 900,
              color: '#fff',
              fontSize: '1.1rem',
            }}
          >
            FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span>
          </Link>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              ← Início
            </Link>
            <Link href="/solicitar" className="btn btn-primary btn-sm">
              Solicitar Produto
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag">Ferramenta Técnica</span>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                fontFamily: 'Montserrat',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              Calculadora de Dosagem Universal
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Consulte doses de referência de tabela ou obtenha estimativas por classe operacional do veículo.
              Adicione quantas medidas precisar.
            </p>
          </div>

          {/* Datalist com sugestões do catálogo consolidado */}
          <datalist id="catalog-measures">
            {DOSAGE_CATALOG.map(e => (
              <option key={e.canonicalMeasure} value={e.canonicalMeasure}>
                {e.canonicalMeasure} — {e.status === 'confirmed' ? `${formatDoses(e.fluidOzPerTire)} — referência` : 'estimativa disponível'}
              </option>
            ))}
          </datalist>

          {/* Card: Pneus a tratar */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ fontWeight: 700 }}>Pneus a tratar</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Selecione da lista ou digite a medida do pneu (ex.: 295/80 R22,5 ou 385/80 R22,5)
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={addLine}>
                <i className="fas fa-plus" /> Adicionar medida
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 40px',
                  gap: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Medida do Pneu
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Qtd. Pneus
                </span>
                <span />
              </div>

              {evaluatedLines.map(({ line, resolution, showUsageSelector }) => (
                <div
                  key={line.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 40px',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        list="catalog-measures"
                        className="form-control"
                        value={line.medida}
                        onChange={e => updateLine(line.id, 'medida', e.target.value)}
                        placeholder="Digite ou escolha a medida (ex: 295/80 R22,5)"
                      />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      className="form-control"
                      value={line.quantidade}
                      onChange={e =>
                        updateLine(line.id, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))
                      }
                    />
                    <button
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: lines.length > 1 ? 'pointer' : 'not-allowed',
                        color: lines.length > 1 ? '#ef4444' : 'var(--text-muted)',
                        padding: '0.5rem',
                        textAlign: 'center',
                      }}
                      title="Remover linha"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>

                  {/* Seletor contextual de classe de uso: exibido apenas quando a medida métrica não possui classificação automática */}
                  {showUsageSelector && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(255,92,0,0.04)',
                        border: '1px dashed rgba(255,92,0,0.25)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <i
                            className="fas fa-truck-moving"
                            style={{ color: 'var(--color-safety-orange)' }}
                          />{' '}
                          Classe de uso do veículo:
                        </span>
                        <select
                          className="form-control"
                          style={{
                            width: 'auto',
                            flex: 1,
                            minWidth: '240px',
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.85rem',
                          }}
                          value={line.usageClass || ''}
                          onChange={e =>
                            updateLine(line.id, 'usageClass', e.target.value as VehicleUsageClass)
                          }
                        >
                          <option value="">Selecione a classe de uso...</option>
                          <option value="light_road">{VEHICLE_USAGE_LABELS.light_road}</option>
                          <option value="heavy_road">{VEHICLE_USAGE_LABELS.heavy_road}</option>
                          <option value="slow_machinery">{VEHICLE_USAGE_LABELS.slow_machinery}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card: Resultados por linha */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Resultado da Aplicação</h3>
            <table className="table" style={{ marginBottom: '1.25rem' }}>
              <thead>
                <tr>
                  <th>Medida</th>
                  <th>Qtd. Pneus</th>
                  <th>Origem da Dose</th>
                  <th>Dose por Pneu</th>
                  <th>Total da Linha</th>
                </tr>
              </thead>
              <tbody>
                {evaluatedLines.map(
                  ({ line, resolution, appliedDose, lineTotalDoses }, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{line.medida || '—'}</td>
                      <td>{line.quantidade}</td>
                      <td>
                        {resolution.status === 'resolved' ? (
                          resolution.source === 'table' ? (
                            <span className="badge badge-blue">Dose de referência</span>
                          ) : (
                            <span className="badge badge-orange">Dose estimada</span>
                          )
                        ) : (
                          <span className="badge badge-gray">Consultar dosagem</span>
                        )}
                      </td>
                      <td>
                        {resolution.status === 'resolved' && appliedDose !== null ? (
                          <span style={{ fontWeight: 600 }}>{formatDoses(appliedDose)}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {resolution.status === 'resolved' && appliedDose !== null ? (
                          formatDoses(lineTotalDoses)
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {/* Aviso de total parcial se houver itens não resolvidos */}
            {hasUnresolved && (
              <div
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <i className="fas fa-info-circle" />
                <span>
                  <strong>Atenção:</strong> {unresolvedMsg}
                </span>
              </div>
            )}

            {/* Painel de totais */}
            {totalDoses > 0 && (
              <div
                style={{
                  background: 'rgba(255,92,0,0.05)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  border: '1px solid rgba(255,92,0,0.15)',
                }}
              >
                <div style={{ marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span style={{ color: hasUnresolved ? '#ea580c' : 'var(--color-safety-orange)' }}>
                    {totalsTitle}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        fontFamily: 'Montserrat',
                        color: 'var(--color-safety-orange)',
                      }}
                    >
                      {formatDoses(totalDoses)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total de doses
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        fontFamily: 'Montserrat',
                        color: 'var(--color-safety-orange)',
                      }}
                    >
                      {ozToLiters(totalDoses).toFixed(1).replace('.', ',')} L
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Volume equivalente
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        fontFamily: 'Montserrat',
                        color: 'var(--color-safety-orange)',
                      }}
                    >
                      ≈ {ozToBucketsFractional(totalDoses).toFixed(2).replace('.', ',')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Baldes (exato)
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      background: 'rgba(255,92,0,0.1)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        fontFamily: 'Montserrat',
                        color: 'var(--color-safety-orange)',
                      }}
                    >
                      {ozToBucketsCeil(totalDoses)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Baldes para pedir
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  1 dose corresponde a 1 onça fluida do produto (≈ 29,6 mL). Balde industrial: 5 galões US
                  (640 doses ≈ 18,9 litros). Baldes para pedido comercial são arredondados para cima (Math.ceil).
                </p>
              </div>
            )}
          </div>

          {/* Área recolhível: Modo Técnico Documental (Fórmula ASI Original) */}
          <details
            className="card"
            style={{
              marginBottom: '1.5rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.925rem',
                color: 'var(--text-secondary)',
                outline: 'none',
              }}
            >
              <i
                className="fas fa-sliders"
                style={{ marginRight: '0.5rem', color: 'var(--color-safety-orange)' }}
              />
              Modo técnico — Medidas físicas reais do pneu (Fórmula ASI documental)
            </summary>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                A fórmula documental original da <em>ASI Chemical Inc.</em> exige a medição física real em
                polegadas da altura total montada e da largura da banda de rodagem (área de contato com o solo).
                Nunca utilize dimensões nominais de seção neste modo.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Altura física real (pol):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="80"
                    className="form-control"
                    value={techHeight}
                    onChange={e => setTechHeight(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Largura real da banda (pol):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="40"
                    className="form-control"
                    value={techTread}
                    onChange={e => setTechTread(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Regime de velocidade:
                  </label>
                  <select
                    className="form-control"
                    value={techSpeed}
                    onChange={e => setTechSpeed(e.target.value as 'over_45_mph' | 'under_45_mph')}
                  >
                    <option value="over_45_mph">&gt; 45 MPH / 72 km/h (Divisor 22)</option>
                    <option value="under_45_mph">&lt; 45 MPH / 72 km/h (Divisor 10)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <input
                  type="checkbox"
                  id="tech-worn-check"
                  checked={techWorn}
                  onChange={e => setTechWorn(e.target.checked)}
                />
                <label
                  htmlFor="tech-worn-check"
                  style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Pneu antigo ou excessivamente desgastado (+10% conforme Tire Chart.pdf)
                </label>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Resultado pela fórmula ASI (Divisor {techResult.divisor})
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--color-safety-orange)',
                    }}
                  >
                    {formatDoseValue(techResult.recommendedOunces)} doses / pneu (≈{' '}
                    {techResult.recommendedOunces.toFixed(2)} fl oz)
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ≈ {ozToLiters(techResult.recommendedOunces).toFixed(2).replace('.', ',')} L por pneu
                </div>
              </div>
            </div>
          </details>

          {/* CTA: Transferência para Solicitação */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #0a0f1e, #1e293b)',
              border: 'none',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>
              Pronto para solicitar?
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Os itens calculados serão transferidos automaticamente para o formulário de solicitação.
            </p>
            <Link href={`/solicitar?calc=${calcParams}`} className="btn btn-primary btn-lg">
              <i className="fas fa-arrow-right" /> Solicitar Flat Free para esta aplicação
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
