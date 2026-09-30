'use client'
import { useEffect, useState } from 'react'
import { getProjects, getTires, getApplications, getReadings, getOccurrences } from '@/lib/storage'
import type { PilotProject, Tire, TireReading, FlatFreeApplication, Occurrence } from '@/lib/types'
import {
  getApplicationForTireCycleAtDate,
  getTireCycleBoundsAtDate,
  isDateInTireCycle,
} from '@/lib/tire-lifecycle'

interface TireStats {
  tire: Tire
  grupo: 'tratado' | 'controle'
  kmRodados: number | null
  sulcoConsumido: number | null
  kmPerMm: number | null
  custoPerKm: number | null
  occurrenceCount: number
  valid: boolean  // true only when a real interval (km > 0, sulco > 0) exists
  invalidReason?: 'insufficient_data' | 'vehicle_transfer' | 'missing_application_vehicle'
}

/**
 * Compute stats for a single tire.
 * A valid interval requires:
 *   - baseline km
 *   - final km > baseline km
 *   - baseline sulco > final sulco (sulcoConsumido > 0)
 *
 * Only data on or after the project start date participates.
 * For TREATED tires: use FlatFreeApplication as baseline only when the
 *   application happened on the project start date; otherwise use project readings.
 * For CONTROL tires: use first and last project readings.
 */
function computeTireStats(
  pt: { tireId: string; grupo: 'tratado' | 'controle' },
  projectStartDate: string,
  tires: Tire[],
  applications: FlatFreeApplication[],
  readings: TireReading[],
  occurrences: Occurrence[]
): TireStats | null {
  const tire = tires.find(t => t.id === pt.tireId)
  if (!tire) return null

  const cycleBounds = getTireCycleBoundsAtDate(
    pt.tireId,
    projectStartDate,
    occurrences
  )

  const tireReadings = readings
    .filter(
      r =>
        r.tireId === pt.tireId &&
        r.data >= projectStartDate &&
        isDateInTireCycle(r.data, cycleBounds)
    )
    .sort(
      (a, b) =>
        a.data.localeCompare(b.data) ||
        a.quilometragemVeiculo - b.quilometragemVeiculo
    )

  const app = getApplicationForTireCycleAtDate(
    pt.tireId,
    projectStartDate,
    applications,
    occurrences
  )

  const occurrenceCount = occurrences.filter(
    o =>
      o.tireId === pt.tireId &&
      o.data >= projectStartDate &&
      o.tipo !== 'recapagem' &&
      o.tipo !== 'retorno_recapagem' &&
      isDateInTireCycle(o.data, cycleBounds)
  ).length

  let baseKm: number | null = null
  let baseSulco: number | null = null
  let finalKm: number | null = null
  let finalSulco: number | null = null

  const useApplicationBaseline =
    pt.grupo === 'tratado' &&
    Boolean(app) &&
    app?.data === projectStartDate

  if (useApplicationBaseline && app && !app.vehicleId) {
    return {
      tire,
      grupo: pt.grupo,
      kmRodados: null,
      sulcoConsumido: null,
      kmPerMm: null,
      custoPerKm: null,
      occurrenceCount,
      valid: false,
      invalidReason: 'missing_application_vehicle',
    }
  }

  if (useApplicationBaseline && app) {
    // When the application happened on the project start date, use it as the
    // treated tire baseline. Older applications define treatment state, but
    // do not pull pre-project mileage into this project's comparison.
    baseKm = app.quilometragemAplicacao
    baseSulco = app.sulcoInicial
    const posteriorReadings = tireReadings.filter(r => r.data >= app.data)

    if (posteriorReadings.some(r => r.vehicleId !== app.vehicleId)) {
      return {
        tire,
        grupo: pt.grupo,
        kmRodados: null,
        sulcoConsumido: null,
        kmPerMm: null,
        custoPerKm: null,
        occurrenceCount,
        valid: false,
        invalidReason: 'vehicle_transfer',
      }
    }

    if (posteriorReadings.length > 0) {
      const last = posteriorReadings[posteriorReadings.length - 1]
      finalKm = last.quilometragemVeiculo
      finalSulco = last.sulco
    }
  } else {
    // A vehicle odometer is only comparable with readings from that same vehicle.
    if (
      tireReadings.length >= 2 &&
      new Set(tireReadings.map(r => r.vehicleId)).size > 1
    ) {
      return {
        tire,
        grupo: pt.grupo,
        kmRodados: null,
        sulcoConsumido: null,
        kmPerMm: null,
        custoPerKm: null,
        occurrenceCount,
        valid: false,
        invalidReason: 'vehicle_transfer',
      }
    }

    // Use first and last readings as interval
    if (tireReadings.length >= 2) {
      const first = tireReadings[0]
      const last = tireReadings[tireReadings.length - 1]
      baseKm = first.quilometragemVeiculo
      baseSulco = first.sulco
      finalKm = last.quilometragemVeiculo
      finalSulco = last.sulco
    }
  }

  // Validate interval
  if (
    baseKm === null || baseSulco === null ||
    finalKm === null || finalSulco === null ||
    finalKm <= baseKm ||
    baseSulco <= finalSulco  // sulco should decrease
  ) {
    return {
      tire, grupo: pt.grupo,
      kmRodados: null, sulcoConsumido: null, kmPerMm: null,
      custoPerKm: null, occurrenceCount, valid: false,
      invalidReason: 'insufficient_data',
    }
  }

  const kmRodados = finalKm - baseKm
  const sulcoConsumido = baseSulco - finalSulco
  const kmPerMm = sulcoConsumido > 0 ? kmRodados / sulcoConsumido : null

  let custoPerKm: number | null = null
  if (tire.custo && kmRodados > 0) {
    custoPerKm = tire.custo / kmRodados
  }

  return {
    tire, grupo: pt.grupo,
    kmRodados, sulcoConsumido,
    kmPerMm,
    custoPerKm,
    occurrenceCount,
    valid: true,
  }
}

function computeStats(
  project: PilotProject,
  tires: Tire[],
  applications: FlatFreeApplication[],
  readings: TireReading[],
  occurrences: Occurrence[]
): TireStats[] {
  return project.pneus
    .map(pt =>
      computeTireStats(
        pt,
        project.dataInicio,
        tires,
        applications,
        readings,
        occurrences
      )
    )
    .filter((s): s is TireStats => s !== null)
}

export default function ComparativosPage() {
  const [projects, setProjects] = useState<PilotProject[]>([])
  const [selected, setSelected] = useState<PilotProject | null>(null)
  const [stats, setStats] = useState<TireStats[]>([])

  useEffect(() => { setProjects(getProjects()) }, [])

  function selectProject(p: PilotProject) {
    if (p.status !== 'ativo' && p.status !== 'concluido') return

    setSelected(p)
    const s = computeStats(
      p,
      getTires(),
      getApplications(),
      getReadings(),
      getOccurrences()
    )
    setStats(s)
  }

  const comparableProjects = projects.filter(
    project => project.status === 'ativo' || project.status === 'concluido'
  )

  // Only include VALID tires in averages
  const validTreated = stats.filter(s => s.grupo === 'tratado' && s.valid)
  const validControl = stats.filter(s => s.grupo === 'controle' && s.valid)
  const allTreated = stats.filter(s => s.grupo === 'tratado')
  const allControl = stats.filter(s => s.grupo === 'controle')

  function avgNum(arr: TireStats[], fn: (s: TireStats) => number | null): number | null {
    const vals = arr.map(fn).filter((v): v is number => v !== null && !isNaN(v))
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  function sumOccurrences(arr: TireStats[]): number {
    return arr.reduce((s, t) => s + t.occurrenceCount, 0)
  }

  const avgKmTreated = avgNum(validTreated, s => s.kmRodados)
  const avgKmControl = avgNum(validControl, s => s.kmRodados)
  const avgMmTreated = avgNum(validTreated, s => s.sulcoConsumido)
  const avgMmControl = avgNum(validControl, s => s.sulcoConsumido)
  const avgKmMmTreated = avgNum(validTreated, s => s.kmPerMm)
  const avgKmMmControl = avgNum(validControl, s => s.kmPerMm)
  const avgCostTreated = avgNum(validTreated.filter(s => s.custoPerKm !== null), s => s.custoPerKm)
  const avgCostControl = avgNum(validControl.filter(s => s.custoPerKm !== null), s => s.custoPerKm)
  const occTreated = sumOccurrences(allTreated)
  const occControl = sumOccurrences(allControl)

  function diffPct(a: number | null, b: number | null): string {
    if (a === null || b === null || b === 0) return 'N/A'
    const diff = ((a - b) / b) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }

  const fmt = (n: number | null, decimals = 1) =>
    n !== null ? n.toLocaleString('pt-BR', { maximumFractionDigits: decimals }) : '—'

  const fmtCost = (n: number | null) =>
    n !== null ? `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}` : '—'

  function invalidReasonLabel(reason?: TireStats['invalidReason']) {
    if (reason === 'vehicle_transfer') return 'Troca de veículo no intervalo'
    if (reason === 'missing_application_vehicle') return 'Aplicação antiga sem veículo-base'
    return 'Dados insuficientes'
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Comparativos</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Análise de desempenho por projeto piloto. Apenas pneus com intervalo válido entram nas médias.</p>

      {!selected ? (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Selecionar Projeto</h3>
          {comparableProjects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhum projeto ativo ou concluído disponível para comparação.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {comparableProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectProject(p)}
                  style={{ textAlign: 'left', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', cursor: 'pointer' }}
                >
                  <div style={{ fontWeight: 700 }}>{p.nome}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.pneus.filter(t => t.grupo === 'tratado').length} tratados · {p.pneus.filter(t => t.grupo === 'controle').length} controle · iniciado {p.dataInicio}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
            <i className="fas fa-arrow-left" /> Voltar
          </button>
          <h2 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{selected.nome}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Dados calculados com base nas leituras registradas. Apenas pneus com intervalo válido entram nas médias. Hodômetros de veículos diferentes não são somados entre si.
          </p>

          {(allTreated.length > 0 || allControl.length > 0) && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Resumo por Grupo</h3>
              <table className="table" style={{ marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    <th>Métrica</th>
                    <th style={{ color: 'var(--color-safety-orange)' }}>Tratado com Flat Free</th>
                    <th style={{ color: '#3b82f6' }}>Controle</th>
                    <th>Diferença Observada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Pneus no grupo</td>
                    <td>{allTreated.length} ({validTreated.length} com dados)</td>
                    <td>{allControl.length} ({validControl.length} com dados)</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Km médios rodados</td>
                    <td>{fmt(avgKmTreated, 0)}</td>
                    <td>{fmt(avgKmControl, 0)}</td>
                    <td><strong>{diffPct(avgKmTreated, avgKmControl)}</strong></td>
                  </tr>
                  <tr>
                    <td>Sulco médio consumido (mm)</td>
                    <td>{fmt(avgMmTreated)}</td>
                    <td>{fmt(avgMmControl)}</td>
                    <td><strong>{diffPct(avgMmTreated, avgMmControl)}</strong></td>
                  </tr>
                  <tr>
                    <td>Km/mm médio</td>
                    <td>{fmt(avgKmMmTreated, 1)}</td>
                    <td>{fmt(avgKmMmControl, 1)}</td>
                    <td><strong>{diffPct(avgKmMmTreated, avgKmMmControl)}</strong></td>
                  </tr>
                  <tr>
                    <td>Custo do pneu / km observado</td>
                    <td>{fmtCost(avgCostTreated)}</td>
                    <td>{fmtCost(avgCostControl)}</td>
                    <td><strong>{diffPct(
                      avgCostTreated !== null ? -avgCostTreated : null,
                      avgCostControl !== null ? -avgCostControl : null
                    )}</strong></td>
                  </tr>
                  <tr>
                    <td>Ocorrências no grupo</td>
                    <td>{occTreated}</td>
                    <td>{occControl}</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ background: 'rgba(148,163,184,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                <div>⚠️ Resultado observado neste projeto e nesta operação. Outros fatores operacionais podem influenciar o desgaste.</div>
                <div style={{ marginTop: '0.25rem' }}>* Custo do pneu / km observado: indicador parcial enquanto o pneu estiver em acompanhamento.</div>
              </div>
            </div>
          )}

          {/* Individual tires */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Detalhamento por Pneu</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Pneu</th><th>Grupo</th><th>Km Rodados</th>
                  <th>Sulco Consumido</th><th>Km/mm</th><th>Custo pneu / km obs.</th><th>Ocorr.</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum pneu com dados.</td></tr>
                ) : stats.map(s => (
                  <tr key={s.tire.id}>
                    <td style={{ fontWeight: 600 }}>{s.tire.identificacaoInterna}</td>
                    <td>
                      <span className={`badge ${s.grupo === 'tratado' ? 'badge-orange' : 'badge-blue'}`}>
                        {s.grupo === 'tratado' ? 'Tratado' : 'Controle'}
                      </span>
                    </td>
                    <td>{s.kmRodados !== null ? s.kmRodados.toLocaleString('pt-BR') : '—'}</td>
                    <td>{s.sulcoConsumido !== null && s.sulcoConsumido > 0 ? `${s.sulcoConsumido.toFixed(1)} mm` : '—'}</td>
                    <td>{s.kmPerMm !== null ? s.kmPerMm.toFixed(1) : '—'}</td>
                    <td>{fmtCost(s.custoPerKm)}</td>
                    <td>{s.occurrenceCount}</td>
                    <td>
                      {!s.valid
                        ? <span className="badge badge-gray">{invalidReasonLabel(s.invalidReason)}</span>
                        : <span className="badge badge-green">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
