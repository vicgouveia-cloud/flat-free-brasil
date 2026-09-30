'use client'
import { useEffect, useState } from 'react'
import {
  getApplications,
  getPositionHistory,
  getReadings,
  getTirePositionAtDate,
  getTires,
  getVehicles,
  saveReadings,
  uuid,
} from '@/lib/storage'
import type { TireReading } from '@/lib/types'
import { getVehicleOdometerBoundsAtDate } from '@/lib/odometer'
import {
  getSlotIdFromPosition,
  getVehicleLayout,
  getVehicleSlotLabel,
} from '@/lib/vehicle-layout'

const today = new Date().toISOString().split('T')[0]

export default function LeiturasPage() {
  const [readings, setReadings] = useState<TireReading[]>([])
  const [tires, setTires] = useState(getTires())
  const [vehicles, setVehicles] = useState(getVehicles())
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState<Omit<TireReading, 'id'>>({
    tireId: '',
    data: today,
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

  function getMountingForReading(tireId: string, date: string) {
    const position = tireId
      ? getTirePositionAtDate(tireId, date, getPositionHistory())
      : null
    const slotId = position
      ? position.slotId || getSlotIdFromPosition(position.posicao)
      : null

    return { position, slotId }
  }

  function syncMountingForReading(tireId: string, date: string) {
    const { position, slotId } = getMountingForReading(tireId, date)

    setSaveError('')
    setForm(prev => ({
      ...prev,
      tireId,
      data: date,
      vehicleId: position?.vehicleId || '',
      posicaoAtual: slotId || '',
    }))
  }

  function handleTireChange(tireId: string) {
    syncMountingForReading(tireId, form.data)
  }

  function handleDateChange(date: string) {
    syncMountingForReading(form.tireId, date)
  }

  const selectedVehicle = vehicles.find(vehicle => vehicle.id === form.vehicleId) || null
  const selectedSlot = selectedVehicle && form.posicaoAtual
    ? getVehicleLayout(selectedVehicle).axles
        .flatMap(axle => axle.slots)
        .find(slot => slot.id === form.posicaoAtual) || null
    : null

  function handleSave() {
    if (!form.tireId || !form.data || !form.quilometragemVeiculo || !form.sulco) return

    if (form.data > today) {
      setSaveError('A data da leitura não pode estar no futuro.')
      return
    }

    const { position, slotId } = getMountingForReading(form.tireId, form.data)
    if (!position || !slotId) {
      setSaveError(
        'Não existe uma montagem registrada para este pneu na data informada. Registre a montagem correta antes de lançar a leitura.'
      )
      return
    }

    const { previous, next } = getVehicleOdometerBoundsAtDate(
      position.vehicleId,
      form.data,
      readings,
      getApplications()
    )

    if (previous && form.quilometragemVeiculo < previous.km) {
      setSaveError(
        `A quilometragem não pode ser menor que o registro anterior deste veículo (${previous.km.toLocaleString('pt-BR')} km em ${previous.date}).`
      )
      return
    }

    if (next && form.quilometragemVeiculo > next.km) {
      setSaveError(
        `A quilometragem não pode ser maior que o registro posterior deste veículo (${next.km.toLocaleString('pt-BR')} km em ${next.date}).`
      )
      return
    }

    const newReading: TireReading = {
      id: uuid(),
      ...form,
      vehicleId: position.vehicleId,
      posicaoAtual: slotId,
    }

    const updatedReadings = [newReading, ...readings]
    saveReadings(updatedReadings)
    setReadings(updatedReadings)

    setSaveError('')
    setShowForm(false)
    setForm({
      tireId: '', data: today,
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
        <button
          onClick={() => {
            setSaveError('')
            setForm({
              tireId: '',
              data: today,
              vehicleId: '',
              quilometragemVeiculo: 0,
              sulco: 0,
              pressao: undefined,
              posicaoAtual: '',
              observacoes: '',
            })
            setShowForm(true)
          }}
          className="btn btn-primary btn-sm"
        >
          <i className="fas fa-plus" /> Registrar Leitura
        </button>
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
              <label className="form-label">Veículo da montagem</label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={selectedVehicle?.identificacaoInterna || 'Sem montagem nesta data'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data *</label>
              <input
                type="date"
                className="form-control"
                max={today}
                value={form.data}
                onChange={e => handleDateChange(e.target.value)}
              />
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
              <label className="form-label">Posição da montagem</label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={
                  selectedSlot
                    ? `${getVehicleSlotLabel(selectedSlot)} (${selectedSlot.id})`
                    : form.posicaoAtual || 'Sem montagem nesta data'
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Observações</label>
              <input type="text" className="form-control" value={form.observacoes || ''} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
            </div>
          </div>
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            Veículo e posição são definidos pelo histórico de montagem do pneu na data da leitura. A leitura não movimenta o pneu.
          </div>
          {saveError && (
            <p style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.8rem' }}>
              {saveError}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={handleSave} className="btn btn-primary"><i className="fas fa-check" /> Salvar</button>
            <button
              onClick={() => {
                setSaveError('')
                setShowForm(false)
              }}
              className="btn btn-outline"
            >
              Cancelar
            </button>
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
