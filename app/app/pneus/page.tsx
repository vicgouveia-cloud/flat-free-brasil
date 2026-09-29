'use client'
import { useEffect, useState } from 'react'
import {
  getTires, saveTires, getApplications, saveApplications,
  getReadings, getPositionHistory, savePositionHistory,
  updatePositionHistoryOnApplication, getOccurrences, getVehicles, getUnits, uuid
} from '@/lib/storage'
import type {
  ApplicationDosageSource,
  Tire,
  TireCondition,
  TireStatus,
  FlatFreeApplication,
  TirePositionHistory,
  Unit,
} from '@/lib/types'
import { DOSAGE_CATALOG, findCatalogEntry, getDosageOz, normalizeMeasure } from '@/lib/dosage'
import { getApplicationForTireCycleAtDate } from '@/lib/tire-lifecycle'
import {
  getSlotIdFromPosition,
  getVehicleLayout,
  getVehicleSlotLabel,
} from '@/lib/vehicle-layout'

const EMPTY_TIRE: Omit<Tire, 'id'> = {
  companyId: 'demo-company-1',
  identificacaoInterna: '',
  numeroFogo: '',
  fabricante: '',
  modelo: '',
  medida: '295/80 R22,5',
  condicao: 'novo',
  custo: undefined,
  dataEntradaOperacao: new Date().toISOString().split('T')[0],
  status: 'em_operacao',
}

const statusLabels: Record<TireStatus, { label: string; cls: string }> = {
  em_operacao: { label: 'Em Operação', cls: 'badge-green' },
  estoque: { label: 'Estoque', cls: 'badge-blue' },
  descartado: { label: 'Descartado', cls: 'badge-red' },
  recapagem: { label: 'Recapagem', cls: 'badge-orange' },
}

const today = new Date().toISOString().split('T')[0]

const applicationDosageSourceLabels: Record<ApplicationDosageSource, string> = {
  table: 'Tabela',
  estimated: 'Estimativa operacional',
  technical: 'Cálculo técnico',
  manual: 'Confirmação manual',
}

export default function PneusPage() {
  const [tires, setTires] = useState<Tire[]>([])
  const [selected, setSelected] = useState<Tire | null>(null)
  const [form, setForm] = useState<Omit<Tire, 'id'>>(EMPTY_TIRE)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tire | null>(null)

  // For detail view
  const [applications, setApplications] = useState(getApplications())
  const [readings, setReadings] = useState(getReadings())
  const [posHistory, setPosHistory] = useState<TirePositionHistory[]>([])
  const [vehicles, setVehicles] = useState(getVehicles())
  const [units, setUnits] = useState<Unit[]>(getUnits())

  // Application form
  const [showAppForm, setShowAppForm] = useState(false)
  const [appForm, setAppForm] = useState<Omit<FlatFreeApplication, 'id'>>(
    {
      tireId: '',
      data: today,
      doseAplicada: 0,
      vehicleId: '',
      posicaoInicial: '',
      lote: '',
      responsavel: '',
      quilometragemAplicacao: 0,
      pressaoInicial: undefined,
      sulcoInicial: 0,
      observacoes: '',
    }
  )

  useEffect(() => {
    setTires(getTires())
    setVehicles(getVehicles())
    setUnits(getUnits())
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_TIRE)
    setShowForm(true)
    setSelected(null)
  }

  function openEdit(t: Tire) {
    setEditing(t)
    setForm({
      companyId: t.companyId,
      identificacaoInterna: t.identificacaoInterna,
      numeroFogo: t.numeroFogo,
      fabricante: t.fabricante,
      modelo: t.modelo,
      medida: t.medida,
      condicao: t.condicao,
      custo: t.custo,
      dataEntradaOperacao: t.dataEntradaOperacao,
      status: t.status,
    })
    setShowForm(true)
    setSelected(null)
  }

  function handleSave() {
    if (!form.identificacaoInterna || !form.fabricante || !form.medida.trim()) return

    const catalogEntry = findCatalogEntry(form.medida)
    const medida = catalogEntry?.canonicalMeasure || normalizeMeasure(form.medida)
    const normalizedForm = { ...form, medida }

    let updated: Tire[]
    if (editing) {
      updated = tires.map(t => t.id === editing.id ? { ...editing, ...normalizedForm } : t)
    } else {
      updated = [...tires, { id: uuid(), ...normalizedForm }]
    }
    saveTires(updated)
    setTires(updated)
    setShowForm(false)
  }

  function openDetail(t: Tire) {
    setSelected(t)
    setShowForm(false)
    setApplications(getApplications())
    setReadings(getReadings())
    setPosHistory(getPositionHistory())
    setVehicles(getVehicles())
    setUnits(getUnits())
    // Pre-fill app form for this tire while preserving recommendation traceability.
    const suggestedOz = getDosageOz(t.medida)
    setAppForm({
      tireId: t.id,
      data: today,
      doseAplicada: suggestedOz ?? 0,
      medidaAplicacao: t.medida,
      doseRecomendadaOz: suggestedOz ?? undefined,
      dosageSource: suggestedOz !== null ? 'table' : 'manual',
      vehicleId: '',
      posicaoInicial: '',
      lote: '',
      responsavel: '',
      quilometragemAplicacao: 0,
      pressaoInicial: undefined,
      sulcoInicial: 0,
      observacoes: '',
    })
    setShowAppForm(false)
  }

  function handleSaveApplication() {
    if (!selected) return
    const existingInCycle = getApplicationForTireCycleAtDate(
      selected.id,
      appForm.data,
      applications,
      getOccurrences()
    )
    if (existingInCycle) return
    if (
      !appForm.tireId ||
      !appForm.vehicleId ||
      !appForm.posicaoInicial ||
      !appForm.quilometragemAplicacao ||
      !appForm.sulcoInicial ||
      !appForm.doseAplicada
    ) return

    const newApp: FlatFreeApplication = { id: uuid(), ...appForm }
    const updated = [...applications, newApp]
    saveApplications(updated)
    setApplications(updated)

    const updatedHistory = updatePositionHistoryOnApplication(newApp, getPositionHistory())
    savePositionHistory(updatedHistory)
    setPosHistory(updatedHistory)

    setShowAppForm(false)
  }

  function getVehicleName(id: string) {
    const v = vehicles.find(v => v.id === id)
    return v ? v.identificacaoInterna : id
  }

  function getUnitNameByVehicleId(vehicleId: string) {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (!vehicle?.unitId) return 'Sem unidade'

    return units.find(unit => unit.id === vehicle.unitId)?.nome || 'Sem unidade'
  }

  const tireReadings = selected
    ? readings.filter(r => r.tireId === selected.id).sort((a, b) => b.data.localeCompare(a.data))
    : []
  const tireApplications = selected
    ? applications.filter(a => a.tireId === selected.id).sort((a, b) => b.data.localeCompare(a.data))
    : []
  const hasApplication = selected
    ? Boolean(
        getApplicationForTireCycleAtDate(
          selected.id,
          today,
          applications,
          getOccurrences()
        )
      )
    : false
  const tirePosHistory = selected
    ? posHistory
        .filter(h => h.tireId === selected.id)
        .sort((a, b) => a.dataInicial.localeCompare(b.dataInicial))
    : []
  const currentPosition = tirePosHistory.find(h => !h.dataFinal) || null
  const selectedApplicationVehicle = vehicles.find(
    vehicle => vehicle.id === appForm.vehicleId
  ) || null
  const occupiedApplicationSlotIds = new Set(
    posHistory
      .filter(
        entry =>
          !entry.dataFinal &&
          entry.vehicleId === appForm.vehicleId &&
          entry.tireId !== selected?.id
      )
      .map(entry => entry.slotId || getSlotIdFromPosition(entry.posicao))
      .filter((slotId): slotId is string => Boolean(slotId))
  )
  const applicationSlots = selectedApplicationVehicle
    ? getVehicleLayout(selectedApplicationVehicle).axles
        .flatMap(axle => axle.slots)
        .filter(slot => !occupiedApplicationSlotIds.has(slot.id))
    : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Pneus</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cadastro e acompanhamento de pneus.</p>
        </div>
        <button onClick={openNew} className="btn btn-primary btn-sm"><i className="fas fa-plus" /> Cadastrar Pneu</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{editing ? 'Editar Pneu' : 'Novo Pneu'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Identificação Interna *</label>
              <input type="text" className="form-control" value={form.identificacaoInterna} onChange={e => setForm(p => ({ ...p, identificacaoInterna: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Nº do Fogo (opcional)</label>
              <input type="text" className="form-control" value={form.numeroFogo || ''} onChange={e => setForm(p => ({ ...p, numeroFogo: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Fabricante *</label>
              <input type="text" className="form-control" value={form.fabricante} onChange={e => setForm(p => ({ ...p, fabricante: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input type="text" className="form-control" value={form.modelo} onChange={e => setForm(p => ({ ...p, modelo: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Medida *</label>
              <input
                type="text"
                className="form-control"
                list="tire-measures"
                required
                value={form.medida}
                onChange={e => setForm(p => ({ ...p, medida: e.target.value }))}
                placeholder="Ex.: 295/80 R22,5"
              />
              <datalist id="tire-measures">
                {DOSAGE_CATALOG.map(entry => (
                  <option key={entry.canonicalMeasure} value={entry.canonicalMeasure} />
                ))}
              </datalist>
              <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Se a medida não estiver nas sugestões, digite a medida real do pneu.
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Condição</label>
              <select className="form-control" value={form.condicao} onChange={e => setForm(p => ({ ...p, condicao: e.target.value as TireCondition }))}>
                <option value="novo">Novo</option>
                <option value="recapado">Recapado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Custo (opcional)</label>
              <input type="number" className="form-control" value={form.custo || ''} onChange={e => setForm(p => ({ ...p, custo: e.target.value ? +e.target.value : undefined }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Entrada em Operação</label>
              <input type="date" className="form-control" value={form.dataEntradaOperacao} onChange={e => setForm(p => ({ ...p, dataEntradaOperacao: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as TireStatus }))}>
                <option value="em_operacao">Em Operação</option>
                <option value="estoque">Estoque</option>
                <option value="recapagem">Recapagem</option>
                <option value="descartado">Descartado</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={handleSave} className="btn btn-primary"><i className="fas fa-check" /> Salvar</button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
          </div>
        </div>
      )}

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
            <i className="fas fa-arrow-left" /> Voltar
          </button>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontWeight: 800 }}>{selected.identificacaoInterna}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{selected.fabricante} {selected.modelo} — {selected.medida}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`badge ${statusLabels[selected.status].cls}`}>{statusLabels[selected.status].label}</span>
                <span className="badge badge-gray">{selected.condicao}</span>
                <button onClick={() => openEdit(selected)} className="btn btn-outline btn-sm"><i className="fas fa-pen" /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {[
                ['Fabricante', selected.fabricante],
                ['Modelo', selected.modelo],
                ['Medida', selected.medida],
                ['Condição', selected.condicao],
                ['Custo', selected.custo ? `R$ ${selected.custo.toLocaleString('pt-BR')}` : '—'],
                ['Entrada op.', selected.dataEntradaOperacao],
                ['Nº Fogo', selected.numeroFogo || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Alocação Atual</h4>
            {currentPosition ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    Unidade
                  </span>
                  <span style={{ fontWeight: 600 }}>{getUnitNameByVehicleId(currentPosition.vehicleId)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    Veículo
                  </span>
                  <span style={{ fontWeight: 600 }}>{getVehicleName(currentPosition.vehicleId)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    Posição
                  </span>
                  <span style={{ fontWeight: 600 }}>{currentPosition.posicao}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Pneu sem alocação atual registrada.
              </p>
            )}
          </div>

          {/* Position History */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Histórico de Posições</h4>
            {tirePosHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma posição registrada.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Veículo</th><th>Posição</th><th>Início</th><th>Fim</th></tr></thead>
                <tbody>
                  {tirePosHistory.map(h => (
                    <tr key={h.id}>
                      <td>{getVehicleName(h.vehicleId)}</td>
                      <td>{h.posicao}</td>
                      <td>{h.dataInicial}</td>
                      <td>{h.dataFinal ?? <span className="badge badge-green">Atual</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Flat Free Applications */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: 700 }}>Aplicação Flat Free</h4>
              {hasApplication ? (
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fas fa-circle-check" /> Aplicação já registrada
                </span>
              ) : (
                <button onClick={() => setShowAppForm(v => !v)} className="btn btn-outline btn-sm">
                  <i className="fas fa-plus" /> Registrar Aplicação
                </button>
              )}
            </div>

            {hasApplication && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Aplicação já registrada no ciclo atual do pneu. Após uma recapagem, um novo ciclo pode receber ou não uma nova aplicação Flat Free.
              </p>
            )}

            {!hasApplication && showAppForm && (
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Nova Aplicação Flat Free</h5>
                {getDosageOz(selected.medida) !== null ? (
                  <div style={{ background: 'rgba(255,92,0,0.08)', border: '1px solid rgba(255,92,0,0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-safety-orange)' }}>
                    <i className="fas fa-info-circle" /> Dose de referência para {selected.medida}: <strong>{getDosageOz(selected.medida)} fl oz</strong>. A quantidade realmente aplicada pode ser diferente e será registrada separadamente.
                  </div>
                ) : (
                  <div style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-triangle-exclamation" /> Esta medida não possui dose automática confirmada. A quantidade informada será registrada como confirmação manual, sem criar uma recomendação técnica automática.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Data *</label>
                    <input type="date" className="form-control" value={appForm.data} onChange={e => setAppForm(p => ({ ...p, data: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Veículo *</label>
                    <select
                      className="form-control"
                      required
                      value={appForm.vehicleId || ''}
                      onChange={e =>
                        setAppForm(p => ({
                          ...p,
                          vehicleId: e.target.value,
                          posicaoInicial: '',
                        }))
                      }
                    >
                      <option value="">Selecionar veículo</option>
                      {vehicles.filter(v => v.status === 'ativo').map(v => (
                        <option key={v.id} value={v.id}>{v.identificacaoInterna}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Posição inicial *</label>
                    <select
                      className="form-control"
                      required
                      disabled={!selectedApplicationVehicle}
                      value={appForm.posicaoInicial || ''}
                      onChange={e =>
                        setAppForm(p => ({ ...p, posicaoInicial: e.target.value }))
                      }
                    >
                      <option value="">
                        {selectedApplicationVehicle
                          ? 'Selecionar posição'
                          : 'Selecione o veículo primeiro'}
                      </option>
                      {applicationSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {getVehicleSlotLabel(slot)} ({slot.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantidade Aplicada (fl oz) *</label>
                    <input type="number" step="0.5" className="form-control" value={appForm.doseAplicada || ''} onChange={e => setAppForm(p => ({ ...p, doseAplicada: +e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quilometragem *</label>
                    <input type="number" className="form-control" value={appForm.quilometragemAplicacao || ''} onChange={e => setAppForm(p => ({ ...p, quilometragemAplicacao: +e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sulco Inicial (mm) *</label>
                    <input type="number" step="0.1" className="form-control" value={appForm.sulcoInicial || ''} onChange={e => setAppForm(p => ({ ...p, sulcoInicial: +e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pressão Inicial (PSI) — opcional</label>
                    <input type="number" className="form-control" value={appForm.pressaoInicial || ''} onChange={e => setAppForm(p => ({ ...p, pressaoInicial: e.target.value ? +e.target.value : undefined }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lote — opcional</label>
                    <input type="text" className="form-control" value={appForm.lote || ''} onChange={e => setAppForm(p => ({ ...p, lote: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Responsável — opcional</label>
                    <input type="text" className="form-control" value={appForm.responsavel || ''} onChange={e => setAppForm(p => ({ ...p, responsavel: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Observações — opcional</label>
                    <input type="text" className="form-control" value={appForm.observacoes || ''} onChange={e => setAppForm(p => ({ ...p, observacoes: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button onClick={handleSaveApplication} className="btn btn-primary btn-sm"><i className="fas fa-check" /> Salvar Aplicação</button>
                  <button onClick={() => setShowAppForm(false)} className="btn btn-outline btn-sm">Cancelar</button>
                </div>
              </div>
            )}

            {tireApplications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma aplicação registrada.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Medida</th>
                    <th>Origem</th>
                    <th>Recomendado</th>
                    <th>Aplicado</th>
                    <th>Veículo</th>
                    <th>Posição</th>
                    <th>Km Aplicação</th>
                    <th>Sulco Inicial</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {tireApplications.map(a => (
                    <tr key={a.id}>
                      <td>{a.data}</td>
                      <td>{a.medidaAplicacao || selected.medida}</td>
                      <td>
                        {a.dosageSource
                          ? applicationDosageSourceLabels[a.dosageSource]
                          : 'Legado'}
                      </td>
                      <td>
                        {a.doseRecomendadaOz !== undefined
                          ? `${a.doseRecomendadaOz} oz`
                          : '—'}
                      </td>
                      <td><strong>{a.doseAplicada} oz</strong></td>
                      <td>{a.vehicleId ? getVehicleName(a.vehicleId) : '—'}</td>
                      <td>{a.posicaoInicial || '—'}</td>
                      <td>{a.quilometragemAplicacao.toLocaleString('pt-BR')}</td>
                      <td>{a.sulcoInicial} mm</td>
                      <td>{a.responsavel || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Readings */}
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Leituras ({tireReadings.length})</h4>
            {tireReadings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma leitura registrada.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Data</th><th>Km Veículo</th><th>Sulco</th><th>Pressão</th><th>Posição</th></tr></thead>
                <tbody>
                  {tireReadings.map(r => (
                    <tr key={r.id}>
                      <td>{r.data}</td>
                      <td>{r.quilometragemVeiculo.toLocaleString('pt-BR')}</td>
                      <td>{r.sulco} mm</td>
                      <td>{r.pressao ? `${r.pressao} PSI` : '—'}</td>
                      <td>{r.posicaoAtual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>ID Interno</th><th>Fabricante</th><th>Medida</th><th>Condição</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {tires.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum pneu cadastrado.</td></tr>
              ) : tires.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.identificacaoInterna}</td>
                  <td>{t.fabricante}</td>
                  <td>{t.medida}</td>
                  <td>{t.condicao}</td>
                  <td><span className={`badge ${statusLabels[t.status].cls}`}>{statusLabels[t.status].label}</span></td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openDetail(t)} className="btn btn-outline btn-sm">Detalhes</button>
                    <button onClick={() => openEdit(t)} className="btn btn-outline btn-sm"><i className="fas fa-pen" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
