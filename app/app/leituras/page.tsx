'use client'
import { useEffect, useState } from 'react'
import { getTires, getVehicles, getReadings, saveReadings, getPositionHistory, savePositionHistory, updatePositionHistoryOnReading, uuid } from '@/lib/storage'
import type { TireReading } from '@/lib/types'
import {
  getSlotIdFromPosition,
  getVehicleLayout,
  getVehicleSlotLabel,
} from '@/lib/vehicle-layout'

export default function LeiturasPage() {
  const [readings, setReadings] = useState<TireReading[]>([])
  const [tires, setTires] = useState(getTires())
  const [vehicles, setVehicles] = useState(getVehicles())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<TireReading, 'id'>>({
    tireId: '',
    data: new Date().toISOString().split('T')[0],
    vehicleId: '',
    quilometragemVeiculo: 0,
    sulco: 0,
    pressao: undefined,
    posicaoAtual: '',
    observacoes: '',
  })

  useEffect(() => {
    setReadings(getReadings().sort((a, b) => b.data.localeCompare(a.data)))
    setTires(getTires())
    setVehicles(getVehicles())
  }, [])

  function getTireName(id: string) {
    const t = tires.find(t => t.id === id)
    return t ? `${t.identificacaoInterna} (${t.medida})` : id
  }

  function getVehicleName(id: string) {
    const v = vehicles.find(v => v.id === id)
    return v ? v.identificacaoInterna : id
  }

  function handleTireChange(tireId: string) {
    const currentPosition = getPositionHistory().find(
      entry => entry.tireId === tireId && !entry.dataFinal
    )
    const slotId = currentPosition
      ? currentPosition.slotId || getSlotIdFromPosition(currentPosition.posicao)
      : null

    setForm(prev => ({
      ...prev,
      tireId,
      vehicleId: currentPosition?.vehicleId || '',
      posicaoAtual: slotId || '',
    }))
  }

  const selectedVehicle = vehicles.find(vehicle => vehicle.id === form.vehicleId) || null
  const occupiedSlotIds = new Set(
    getPositionHistory()
      .filter(
        entry =>
          !entry.dataFinal &&
          entry.vehicleId === form.vehicleId &&
          entry.tireId !== form.tireId
      )
      .map(entry => entry.slotId || getSlotIdFromPosition(entry.posicao))
      .filter((slotId): slotId is string => Boolean(slotId))
  )
  const availableSlots = selectedVehicle
    ? getVehicleLayout(selectedVehicle).axles
        .flatMap(axle => axle.slots)
        .filter(slot => !occupiedSlotIds.has(slot.id))
    : []

  function handleSave() {
    if (!form.tireId || !form.vehicleId || !form.posicaoAtual || !form.quilometragemVeiculo || !form.sulco) return

    const newReading: TireReading = { id: uuid(), ...form }

    // Update readings
    const updatedReadings = [newReading, ...readings]
    saveReadings(updatedReadings)
    setReadings(updatedReadings)

    // Update position history
    const currentHistory = getPositionHistory()
    const updatedHistory = updatePositionHistoryOnReading(newReading, currentHistory)
    savePositionHistory(updatedHistory)

    setShowForm(false)
    setForm({
      tireId: '', data: new Date().toISOString().split('T')[0],
      vehicleId: '', quilometragemVeiculo: 0, sulco: 0,
      pressao: undefined, posicaoAtual: '', observacoes: '',
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Leituras</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Registro histórico de medições de pneus.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><i className="fas fa-plus" /> Registrar Leitura</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Nova Leitura</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pneu *</label>
              <select className="form-control" value={form.tireId} onChange={e => handleTireChange(e.target.value)}>
                <option value="">Selecionar pneu</option>
                {tires.map(t => <option key={t.id} value={t.id}>{t.identificacaoInterna} — {t.medida}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Veículo *</label>
              <select
                className="form-control"
                value={form.vehicleId}
                onChange={e =>
                  setForm(p => ({ ...p, vehicleId: e.target.value, posicaoAtual: '' }))
                }
              >
                <option value="">Selecionar veículo</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.identificacaoInterna}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data *</label>
              <input type="date" className="form-control" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Quilometragem do Veículo *</label>
              <input type="number" className="form-control" value={form.quilometragemVeiculo || ''} onChange={e => setForm(p => ({ ...p, quilometragemVeiculo: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Profundidade do Sulco (mm) *</label>
              <input type="number" step="0.1" className="form-control" value={form.sulco || ''} onChange={e => setForm(p => ({ ...p, sulco: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Pressão (PSI) — opcional</label>
              <input type="number" className="form-control" value={form.pressao || ''} onChange={e => setForm(p => ({ ...p, pressao: e.target.value ? +e.target.value : undefined }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Posição Atual *</label>
              <select
                className="form-control"
                value={form.posicaoAtual}
                disabled={!selectedVehicle}
                onChange={e => setForm(p => ({ ...p, posicaoAtual: e.target.value }))}
              >
                <option value="">
                  {selectedVehicle ? 'Selecionar posição' : 'Selecione o veículo primeiro'}
                </option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {getVehicleSlotLabel(slot)} ({slot.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Observações</label>
              <input type="text" className="form-control" value={form.observacoes || ''} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={handleSave} className="btn btn-primary"><i className="fas fa-check" /> Salvar</button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
          </div>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead><tr><th>Data</th><th>Pneu</th><th>Veículo</th><th>Km</th><th>Sulco</th><th>Pressão</th><th>Posição</th></tr></thead>
          <tbody>
            {readings.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhuma leitura registrada.</td></tr>
            ) : readings.map(r => (
              <tr key={r.id}>
                <td>{r.data}</td>
                <td style={{ fontWeight: 600 }}>{getTireName(r.tireId)}</td>
                <td>{getVehicleName(r.vehicleId)}</td>
                <td>{r.quilometragemVeiculo.toLocaleString('pt-BR')}</td>
                <td>{r.sulco} mm</td>
                <td>{r.pressao ? `${r.pressao} PSI` : '—'}</td>
                <td>{r.posicaoAtual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
