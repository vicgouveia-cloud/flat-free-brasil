'use client'
import { useEffect, useState } from 'react'
import {
  getApplications,
  getOccurrences,
  getPositionHistory,
  getTires,
  mountTireToVehicleSlot,
  getUnits,
  getVehicles,
  savePositionHistory,
  saveVehicles,
  uuid,
} from '@/lib/storage'
import VehicleTopView, { type VehicleMountedTire } from '@/components/VehicleTopView'
import {
  VEHICLE_LAYOUT_LABELS,
  getSlotIdFromPosition,
  getVehicleLayout,
  inferVehicleLayoutType,
} from '@/lib/vehicle-layout'
import { getApplicationForTireCycleAtDate } from '@/lib/tire-lifecycle'
import type {
  Tire,
  Unit,
  Vehicle,
  VehicleAxleTireConfiguration,
  VehicleLayoutType,
  VehicleStatus,
} from '@/lib/types'

const EMPTY_VEHICLE: Omit<Vehicle, 'id'> = {
  companyId: 'demo-company-1',
  unitId: '',
  layoutType: 'truck',
  identificacaoInterna: '',
  placa: '',
  tipo: 'Caminhão 6x4',
  fabricanteModelo: '',
  configuracaoEixos: '',
  axleCount: 3,
  axleTireConfigurations: [],
  status: 'ativo',
}

const statusLabels: Record<VehicleStatus, { label: string; cls: string }> = {
  ativo: { label: 'Ativo', cls: 'badge-green' },
  inativo: { label: 'Inativo', cls: 'badge-gray' },
  em_manutencao: { label: 'Em Manutenção', cls: 'badge-orange' },
}

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [form, setForm] = useState(EMPTY_VEHICLE)
  const [showForm, setShowForm] = useState(false)
  const [visualizing, setVisualizing] = useState<Vehicle | null>(null)
  const [mountedTires, setMountedTires] = useState<VehicleMountedTire[]>([])
  const [tires, setTires] = useState<Tire[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [mountTireId, setMountTireId] = useState('')
  const [mountDate, setMountDate] = useState(new Date().toISOString().split('T')[0])
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0])
  const [mountError, setMountError] = useState('')
  const [vehicleSaveError, setVehicleSaveError] = useState('')

  useEffect(() => {
    setVehicles(getVehicles())
    setUnits(getUnits())
    setTires(getTires())
  }, [])

  function openNew() {
    setEditing(null)
    setVehicleSaveError('')
    setForm(EMPTY_VEHICLE)
    setShowForm(true)
    setVisualizing(null)
  }

  function getMountedTiresAtDate(vehicle: Vehicle, date: string): VehicleMountedTire[] {
    const tires = getTires()
    const applications = getApplications()
    const occurrences = getOccurrences()

    return getPositionHistory()
      .filter(
        entry =>
          entry.vehicleId === vehicle.id &&
          entry.dataInicial <= date &&
          (!entry.dataFinal || date < entry.dataFinal)
      )
      .map(entry => {
        const tire = tires.find(item => item.id === entry.tireId)
        const slotId = entry.slotId || getSlotIdFromPosition(entry.posicao)
        if (!tire || !slotId) return null

        const application = getApplicationForTireCycleAtDate(
          tire.id,
          date,
          applications,
          occurrences
        )

        return {
          slotId,
          tire,
          hasFlatFree: Boolean(application && application.data <= date),
        } satisfies VehicleMountedTire
      })
      .filter((item): item is VehicleMountedTire => item !== null)
  }

  function openVehicleDrawing(vehicle: Vehicle) {
    const today = new Date().toISOString().split('T')[0]

    setMountedTires(getMountedTiresAtDate(vehicle, today))
    setViewDate(today)
    setMountDate(today)
    setVisualizing(vehicle)
    setSelectedSlotId(null)
    setMountTireId('')
    setMountError('')
    setShowForm(false)
  }

  function handleViewDateChange(date: string) {
    if (!visualizing || !date) return

    setViewDate(date)
    setMountedTires(getMountedTiresAtDate(visualizing, date))
    setSelectedSlotId(null)
    setMountTireId('')
    setMountError('')
  }

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId)
    setMountTireId('')
    setMountError('')
  }

  function handleMountTire() {
    if (!visualizing || !selectedSlotId || !mountTireId || !mountDate) return

    const today = new Date().toISOString().split('T')[0]
    if (mountDate > today) {
      setMountError('A data da montagem não pode estar no futuro.')
      return
    }

    const currentHistory = getPositionHistory()
    const result = mountTireToVehicleSlot(
      mountTireId,
      visualizing.id,
      selectedSlotId,
      mountDate,
      currentHistory
    )

    if (!result.ok) {
      const messages = {
        slot_occupied: 'Esta posição já está ocupada.',
        invalid_date: 'A data não pode ser anterior ao início da montagem atual deste pneu.',
        already_mounted: 'Este pneu já está montado nesta posição.',
        tire_history_conflict: 'Esta data invade um período de montagem já registrado para este pneu.',
        slot_history_conflict: 'Esta data invade um período em que esta posição já estava ocupada por outro pneu.',
      }
      setMountError(result.error ? messages[result.error] : 'Não foi possível atualizar a montagem.')
      return
    }

    savePositionHistory(result.history)
    setViewDate(today)
    setMountedTires(getMountedTiresAtDate(visualizing, today))
    setSelectedSlotId(null)
    setMountTireId('')
    setMountError('')
  }

  function openEdit(v: Vehicle) {
    setEditing(v)
    setVehicleSaveError('')
    setForm({
      companyId: v.companyId,
      unitId: v.unitId || '',
      layoutType: inferVehicleLayoutType(v),
      identificacaoInterna: v.identificacaoInterna,
      placa: v.placa || '',
      tipo: v.tipo,
      fabricanteModelo: v.fabricanteModelo || '',
      configuracaoEixos: v.configuracaoEixos || '',
      axleCount: v.axleCount ?? getVehicleLayout(v).axleCount,
      axleTireConfigurations: v.axleTireConfigurations || [],
      status: v.status,
    })
    setShowForm(true)
    setVisualizing(null)
  }

  const formLayout = getVehicleLayout({ id: editing?.id || 'draft', ...form } as Vehicle)

  function updateAxleTireConfiguration(
    axleIndex: number,
    value: VehicleAxleTireConfiguration
  ) {
    setForm(prev => {
      const next = [...(prev.axleTireConfigurations || [])]
      next[axleIndex] = value
      return { ...prev, axleTireConfigurations: next }
    })
  }

  function handleSave() {
    if (!form.identificacaoInterna.trim() || !form.unitId) return

    if (editing) {
      const hasPositionHistory = getPositionHistory().some(
        entry => entry.vehicleId === editing.id
      )
      const layoutSignature = (vehicle: Vehicle) => {
        const layout = getVehicleLayout(vehicle)
        return [
          layout.type,
          ...layout.axles.map(
            axle => `E${axle.axle}:${axle.slots.map(slot => slot.id).join(',')}`
          ),
        ].join('|')
      }

      if (
        hasPositionHistory &&
        layoutSignature(editing) !==
          layoutSignature({ ...editing, ...form } as Vehicle)
      ) {
        setVehicleSaveError(
          'Este veículo já possui histórico de montagem. A quantidade de eixos, o tipo de layout e a rodagem simples/dupla não podem mais ser alterados, para preservar os desenhos históricos.'
        )
        return
      }
    }

    let updated: Vehicle[]
    if (editing) {
      updated = vehicles.map(v => v.id === editing.id ? { ...editing, ...form } : v)
    } else {
      updated = [...vehicles, { id: uuid(), ...form }]
    }
    saveVehicles(updated)
    setVehicles(updated)
    setVehicleSaveError('')
    setShowForm(false)
  }

  function handleDeactivate(id: string) {
    const updated = vehicles.map(v => v.id === id ? { ...v, status: 'inativo' as VehicleStatus } : v)
    saveVehicles(updated)
    setVehicles(updated)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Veículos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cadastro e gestão de veículos da frota.</p>
        </div>
        <button onClick={openNew} className="btn btn-primary btn-sm"><i className="fas fa-plus" /> Cadastrar Veículo</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{editing ? 'Editar Veículo' : 'Novo Veículo'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              ['identificacaoInterna', 'Identificação Interna *', 'text'],
              ['placa', 'Placa (opcional)', 'text'],
              ['tipo', 'Tipo de Veículo', 'text'],
              ['fabricanteModelo', 'Fabricante / Modelo', 'text'],
              ['configuracaoEixos', 'Configuração de Eixos', 'text'],
            ].map(([field, label]) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input type="text" className="form-control" value={(form as Record<string, string>)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Quantidade de eixos *</label>
              <input
                type="number"
                min={1}
                max={8}
                className="form-control"
                value={form.axleCount ?? ''}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    axleCount: e.target.value ? Math.max(1, Math.min(8, Number(e.target.value))) : undefined,
                  }))
                }
              />
              <span style={{ display: 'block', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                Veículos legados sem este campo continuam usando a configuração textual como referência.
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de layout *</label>
              <select
                className="form-control"
                required
                value={form.layoutType || 'other'}
                onChange={e => setForm(p => ({ ...p, layoutType: e.target.value as VehicleLayoutType }))}
              >
                {(Object.entries(VEHICLE_LAYOUT_LABELS) as [VehicleLayoutType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unidade *</label>
              <select
                className="form-control"
                required
                value={form.unitId || ''}
                onChange={e => setForm(p => ({ ...p, unitId: e.target.value }))}
              >
                <option value="">Selecionar unidade</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as VehicleStatus }))}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="em_manutencao">Em Manutenção</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Rodagem por eixo</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {formLayout.axles.map((axle, index) => (
                  <div key={axle.axle}>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Eixo {axle.axle}</label>
                    <select
                      className="form-control"
                      value={form.axleTireConfigurations?.[index] || 'auto'}
                      onChange={e =>
                        updateAxleTireConfiguration(
                          index,
                          e.target.value as VehicleAxleTireConfiguration
                        )
                      }
                    >
                      <option value="auto">Automático</option>
                      <option value="single">Simples</option>
                      <option value="dual">Duplo</option>
                    </select>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Use Automático para manter a inferência atual. Selecione Simples ou Duplo quando a configuração real do eixo for diferente.
              </p>
            </div>
          </div>
          {vehicleSaveError && (
            <p style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.8rem' }}>
              {vehicleSaveError}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={handleSave} className="btn btn-primary"><i className="fas fa-check" /> Salvar</button>
            <button
              onClick={() => {
                setVehicleSaveError('')
                setShowForm(false)
              }}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {visualizing && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontWeight: 800, marginBottom: '0.2rem' }}>{visualizing.identificacaoInterna}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {visualizing.fabricanteModelo || visualizing.tipo} • {visualizing.configuracaoEixos || 'configuração não informada'}
              </p>
            </div>
            <button onClick={() => setVisualizing(null)} className="btn btn-outline btn-sm">Fechar desenho</button>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'end',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
            }}
          >
            <div className="form-group" style={{ marginBottom: 0, minWidth: '220px' }}>
              <label className="form-label">Visualizar montagem em</label>
              <input
                type="date"
                className="form-control"
                value={viewDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => handleViewDateChange(e.target.value)}
              />
            </div>
            {viewDate !== new Date().toISOString().split('T')[0] && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  handleViewDateChange(new Date().toISOString().split('T')[0])
                }
              >
                Voltar para hoje
              </button>
            )}
          </div>

          {viewDate !== new Date().toISOString().split('T')[0] && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
              }}
            >
              Visualização histórica em <strong>{viewDate}</strong>. O desenho fica somente para consulta nesta data.
            </div>
          )}

          <VehicleTopView
            vehicle={visualizing}
            mountedTires={mountedTires}
            referenceDate={viewDate}
            selectedSlotId={viewDate === new Date().toISOString().split('T')[0] ? selectedSlotId : null}
            onSelectFreeSlot={
              viewDate === new Date().toISOString().split('T')[0]
                ? handleSelectSlot
                : undefined
            }
          />

          {viewDate === new Date().toISOString().split('T')[0] && selectedSlotId && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
              }}
            >
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
                Montar pneu em {selectedSlotId}
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pneu *</label>
                  <select
                    className="form-control"
                    value={mountTireId}
                    onChange={e => {
                      setMountTireId(e.target.value)
                      setMountError('')
                    }}
                  >
                    <option value="">Selecionar pneu</option>
                    {tires
                      .filter(tire => tire.status === 'em_operacao')
                      .map(tire => (
                        <option key={tire.id} value={tire.id}>
                          {tire.identificacaoInterna} — {tire.medida}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Data da montagem *</label>
                  <input
                    type="date"
                    className="form-control"
                    max={new Date().toISOString().split('T')[0]}
                    value={mountDate}
                    onChange={e => {
                      setMountDate(e.target.value)
                      setMountError('')
                    }}
                  />
                </div>
              </div>

              {mountError && (
                <p style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.8rem' }}>
                  {mountError}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!mountTireId || !mountDate}
                  onClick={handleMountTire}
                >
                  Confirmar montagem
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSelectedSlotId(null)
                    setMountTireId('')
                    setMountError('')
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead><tr><th>ID Interno</th><th>Unidade</th><th>Placa</th><th>Tipo</th><th>Modelo</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum veículo cadastrado.</td></tr>
            ) : vehicles.map(v => (
              <tr key={v.id}>
                <td style={{ fontWeight: 600 }}>{v.identificacaoInterna}</td>
                <td>{units.find(unit => unit.id === v.unitId)?.nome || 'Sem unidade'}</td>
                <td>{v.placa || '—'}</td>
                <td>{v.tipo}</td>
                <td>{v.fabricanteModelo || '—'}</td>
                <td><span className={`badge ${statusLabels[v.status].cls}`}>{statusLabels[v.status].label}</span></td>
                <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openVehicleDrawing(v)}
                    className="btn btn-outline btn-sm"
                  >
                    <i className="fas fa-diagram-project" /> Desenho
                  </button>
                  <button onClick={() => openEdit(v)} className="btn btn-outline btn-sm"><i className="fas fa-pen" /></button>
                  {v.status !== 'inativo' && <button onClick={() => handleDeactivate(v.id)} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none' }}><i className="fas fa-ban" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
