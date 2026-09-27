'use client'
import { useEffect, useState } from 'react'
import { getProjects, getTires, getApplications, getReadings } from '@/lib/storage'
import type { PilotProject, Tire, TireReading, FlatFreeApplication } from '@/lib/types'

interface TireStats {
  tire: Tire
  grupo: 'tratado' | 'controle'
  initialReading: TireReading | null
  lastReading: TireReading | null
  application: FlatFreeApplication | null
  kmRodados: number
  sulcoConsumido: number
  kmPerMm: number | null
}

function computeStats(project: PilotProject, tires: Tire[], applications: FlatFreeApplication[], readings: TireReading[]): TireStats[] {
  return project.pneus.map(pt => {
    const tire = tires.find(t => t.id === pt.tireId)
    if (!tire) return null
    const tireReadings = readings.filter(r => r.tireId === pt.tireId).sort((a, b) => a.data.localeCompare(b.data))
    const app = applications.find(a => a.tireId === pt.tireId) || null
    const initial = tireReadings[0] || null
    const last = tireReadings[tireReadings.length - 1] || null
    let kmRodados = 0
    let sulcoConsumido = 0
    let kmPerMm: number | null = null
    if (initial && last && initial.id !== last.id) {
      kmRodados = last.quilometragemVeiculo - initial.quilometragemVeiculo
      sulcoConsumido = initial.sulco - last.sulco
      if (sulcoConsumido > 0 && kmRodados > 0) kmPerMm = kmRodados / sulcoConsumido
    } else if (app && last) {
      kmRodados = last.quilometragemVeiculo - app.quilometragemAplicacao
      sulcoConsumido = app.sulcoInicial - last.sulco
      if (sulcoConsumido > 0 && kmRodados > 0) kmPerMm = kmRodados / sulcoConsumido
    }
    return { tire, grupo: pt.grupo, initialReading: initial, lastReading: last, application: app, kmRodados, sulcoConsumido, kmPerMm }
  }).filter(Boolean) as TireStats[]
}

export default function ComparativosPage() {
  const [projects, setProjects] = useState<PilotProject[]>([])
  const [selected, setSelected] = useState<PilotProject | null>(null)
  const [stats, setStats] = useState<TireStats[]>([])

  useEffect(() => { setProjects(getProjects()) }, [])

  function selectProject(p: PilotProject) {
    setSelected(p)
    const s = computeStats(p, getTires(), getApplications(), getReadings())
    setStats(s)
  }

  const treated = stats.filter(s => s.grupo === 'tratado')
  const control = stats.filter(s => s.grupo === 'controle')

  function avg(arr: TireStats[], field: keyof TireStats): number | null {
    const vals = arr.map(s => s[field]).filter((v): v is number => typeof v === 'number' && !isNaN(v))
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const avgKmTreated = avg(treated, 'kmRodados')
  const avgKmControl = avg(control, 'kmRodados')
  const avgMmTreated = avg(treated, 'sulcoConsumido')
  const avgMmControl = avg(control, 'sulcoConsumido')
  const avgKmMmTreated = avg(treated.filter(s => s.kmPerMm !== null), 'kmPerMm')
  const avgKmMmControl = avg(control.filter(s => s.kmPerMm !== null), 'kmPerMm')

  function diffPct(a: number | null, b: number | null): string {
    if (a === null || b === null || b === 0) return 'N/A'
    const diff = ((a - b) / b) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }

  const fmt = (n: number | null) => n !== null ? n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—'

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Comparativos</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Análise de desempenho por projeto piloto.</p>

      {!selected ? (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Selecionar Projeto</h3>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum projeto encontrado. Crie um projeto piloto primeiro.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projects.map(p => (
                <button key={p.id} onClick={() => selectProject(p)} style={{ textAlign: 'left', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 700 }}>{p.nome}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.pneus.filter(t => t.grupo === 'tratado').length} tratados · {p.pneus.filter(t => t.grupo === 'controle').length} controle · iniciado {p.dataInicio}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}><i className="fas fa-arrow-left" /> Voltar</button>
          <h2 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{selected.nome}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Dados calculados com base nas leituras registradas.</p>

          {(treated.length > 0 || control.length > 0) && (
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
                    <td>Pneus avaliados</td>
                    <td>{treated.length}</td>
                    <td>{control.length}</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Km médios rodados</td>
                    <td>{fmt(avgKmTreated)}</td>
                    <td>{fmt(avgKmControl)}</td>
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
                    <td>{fmt(avgKmMmTreated)}</td>
                    <td>{fmt(avgKmMmControl)}</td>
                    <td><strong>{diffPct(avgKmMmTreated, avgKmMmControl)}</strong></td>
                  </tr>
                </tbody>
              </table>
              <div style={{ background: 'rgba(148,163,184,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ⚠️ Resultado observado neste projeto e nesta operação. Outros fatores operacionais podem influenciar o desgaste.
              </div>
            </div>
          )}

          {/* Individual tires */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Detalhamento por Pneu</h3>
            <table className="table">
              <thead>
                <tr><th>Pneu</th><th>Grupo</th><th>Km Rodados</th><th>Sulco Consumido</th><th>Km/mm</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum pneu com dados.</td></tr>
                ) : stats.map(s => {
                  const hasData = s.lastReading !== null
                  const kmPerMmStr = s.kmPerMm !== null ? s.kmPerMm.toFixed(1) : '—'
                  return (
                    <tr key={s.tire.id}>
                      <td style={{ fontWeight: 600 }}>{s.tire.identificacaoInterna}</td>
                      <td><span className={`badge ${s.grupo === 'tratado' ? 'badge-orange' : 'badge-blue'}`}>{s.grupo === 'tratado' ? 'Tratado' : 'Controle'}</span></td>
                      <td>{hasData ? s.kmRodados.toLocaleString('pt-BR') : '—'}</td>
                      <td>{hasData && s.sulcoConsumido > 0 ? `${s.sulcoConsumido.toFixed(1)} mm` : '—'}</td>
                      <td>{hasData ? kmPerMmStr : '—'}</td>
                      <td>{!hasData ? <span className="badge badge-gray">Aguardando leituras</span> : s.sulcoConsumido <= 0 ? <span className="badge badge-orange">Dados insuficientes</span> : <span className="badge badge-green">OK</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
