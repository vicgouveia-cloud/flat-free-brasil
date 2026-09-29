'use client'

import { useEffect, useState } from 'react'
import {
  closeTirePositionAtDate,
  getOccurrences,
  getPositionHistory,
  getTires,
  saveOccurrences,
  savePositionHistory,
  saveTires,
  uuid,
} from '@/lib/storage'
import type { Occurrence, OccurrenceType, Tire } from '@/lib/types'

const typeLabels: Record<OccurrenceType, string> = {
  perfuracao: 'Perfuração',
  reparo: 'Reparo',
  perda_pressao: 'Perda de pressão',
  valvula: 'Válvula',
  rodizio: 'Rodízio',
  retirada: 'Retirada',
  recapagem: 'Recapagem',
  retorno_recapagem: 'Retorno da recapagem',
  outro: 'Outro',
}

const today = new Date().toISOString().split('T')[0]

export default function OcorrenciasPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [tires, setTires] = useState<Tire[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm] = useState<Omit<Occurrence, 'id'>>({
    tireId: '',
    data: today,
    tipo: 'perfuracao',
    descricao: '',
  })

  useEffect(() => {
    setOccurrences(
      getOccurrences().sort((a, b) => b.data.localeCompare(a.data))
    )
    setTires(getTires())
  }, [])

  function getTireName(tireId: string) {
    const tire = tires.find(t => t.id === tireId)
    return tire ? `${tire.identificacaoInterna} — ${tire.medida}` : tireId
  }

  function handleSave() {
    if (!form.tireId || !form.data || !form.descricao.trim()) return

    if (form.data > today) {
      setSaveError('A data da ocorrência não pode estar no futuro.')
      return
    }

    let updatedPositionHistory = getPositionHistory()

    if (form.tipo === 'retorno_recapagem') {
      const tire = tires.find(item => item.id === form.tireId)
      const latestRecap = occurrences
        .filter(
          occurrence =>
            occurrence.tireId === form.tireId &&
            occurrence.tipo === 'recapagem'
        )
        .sort((a, b) => b.data.localeCompare(a.data))[0]

      if (!tire || tire.status !== 'recapagem') {
        setSaveError(
          'O retorno da recapagem só pode ser registrado para um pneu que esteja com status Recapagem.'
        )
        return
      }

      if (!latestRecap || form.data < latestRecap.data) {
        setSaveError(
          'A data de retorno não pode ser anterior à recapagem que iniciou o ciclo atual.'
        )
        return
      }
    }

    if (form.tipo === 'recapagem' || form.tipo === 'retirada') {
      const closeResult = closeTirePositionAtDate(
        form.tireId,
        form.data,
        updatedPositionHistory
      )

      if (!closeResult.ok) {
        setSaveError(
          form.tipo === 'recapagem'
            ? 'A data da recapagem não pode ser anterior ao início da montagem atual deste pneu.'
            : 'A data da retirada não pode ser anterior ao início da montagem atual deste pneu.'
        )
        return
      }

      updatedPositionHistory = closeResult.history
    }

    const occurrence: Occurrence = {
      id: uuid(),
      ...form,
      descricao: form.descricao.trim(),
    }

    const updated = [occurrence, ...occurrences].sort((a, b) =>
      b.data.localeCompare(a.data)
    )

    saveOccurrences(updated)
    setOccurrences(updated)

    if (form.tipo === 'recapagem' || form.tipo === 'retirada') {
      savePositionHistory(updatedPositionHistory)
    }

    if (form.tipo === 'recapagem') {
      const updatedTires = tires.map(tire =>
        tire.id === form.tireId
          ? { ...tire, status: 'recapagem' as const }
          : tire
      )
      saveTires(updatedTires)
      setTires(updatedTires)
    }

    if (form.tipo === 'retorno_recapagem') {
      const updatedTires = tires.map(tire =>
        tire.id === form.tireId
          ? {
              ...tire,
              condicao: 'recapado' as const,
              status: 'em_operacao' as const,
            }
          : tire
      )
      saveTires(updatedTires)
      setTires(updatedTires)
    }

    setSaveError('')
    setShowForm(false)
    setForm({
      tireId: '',
      data: today,
      tipo: 'perfuracao',
      descricao: '',
    })
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Ocorrências
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Registro de eventos operacionais relacionados aos pneus acompanhados.
          </p>
        </div>
        <button
          onClick={() => {
            setSaveError('')
            setForm({
              tireId: '',
              data: today,
              tipo: 'perfuracao',
              descricao: '',
            })
            setShowForm(true)
          }}
          className="btn btn-primary btn-sm"
        >
          <i className="fas fa-plus" /> Registrar Ocorrência
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>
            Nova Ocorrência
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Pneu *</label>
              <select
                className="form-control"
                required
                value={form.tireId}
                onChange={e => {
                  setSaveError('')
                  setForm(p => ({ ...p, tireId: e.target.value }))
                }}
              >
                <option value="">Selecionar pneu</option>
                {tires.map(tire => (
                  <option key={tire.id} value={tire.id}>
                    {tire.identificacaoInterna} — {tire.medida}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data *</label>
              <input
                type="date"
                className="form-control"
                required
                max={today}
                value={form.data}
                onChange={e => {
                  setSaveError('')
                  setForm(p => ({ ...p, data: e.target.value }))
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo *</label>
              <select
                className="form-control"
                value={form.tipo}
                onChange={e => {
                  setSaveError('')
                  setForm(p => ({ ...p, tipo: e.target.value as OccurrenceType }))
                }}
              >
                {(Object.entries(typeLabels) as [OccurrenceType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Descrição *</label>
              <textarea
                className="form-control"
                rows={3}
                required
                value={form.descricao}
                onChange={e =>
                  setForm(p => ({ ...p, descricao: e.target.value }))
                }
                placeholder="Descreva o que ocorreu e, quando relevante, a ação tomada."
              />
            </div>
          </div>

          {(form.tipo === 'recapagem' ||
            form.tipo === 'retirada' ||
            form.tipo === 'retorno_recapagem') && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(255,92,0,0.08)',
                border: '1px solid rgba(255,92,0,0.2)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
              }}
            >
              {form.tipo === 'recapagem'
                ? 'A recapagem encerra o ciclo atual do pneu, fecha sua montagem vigente nesta data e altera o status para Recapagem.'
                : form.tipo === 'retorno_recapagem'
                ? 'O retorno da recapagem mantém o novo ciclo já iniciado, marca o pneu como Recapado e o devolve ao status Em operação. A nova montagem pode ocorrer com ou sem uma nova aplicação Flat Free.'
                : 'A retirada fecha a montagem vigente do pneu nesta data. O ciclo do pneu e seu status permanecem inalterados, permitindo uma nova montagem posteriormente.'}
            </div>
          )}

          {saveError && (
            <p style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.8rem' }}>
              {saveError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={handleSave} className="btn btn-primary">
              <i className="fas fa-check" /> Salvar
            </button>
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
          <thead>
            <tr>
              <th>Data</th>
              <th>Pneu</th>
              <th>Tipo</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {occurrences.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    padding: '2rem',
                  }}
                >
                  Nenhuma ocorrência registrada.
                </td>
              </tr>
            ) : (
              occurrences.map(occurrence => (
                <tr key={occurrence.id}>
                  <td>{occurrence.data}</td>
                  <td style={{ fontWeight: 600 }}>
                    {getTireName(occurrence.tireId)}
                  </td>
                  <td>
                    <span className="badge badge-orange">
                      {typeLabels[occurrence.tipo]}
                    </span>
                  </td>
                  <td>{occurrence.descricao}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
