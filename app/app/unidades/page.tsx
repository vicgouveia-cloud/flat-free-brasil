'use client'

import { useEffect, useState } from 'react'
import { getUnits, saveUnits, uuid } from '@/lib/storage'
import type { Unit } from '@/lib/types'

const EMPTY_UNIT: Omit<Unit, 'id'> = {
  companyId: 'demo-company-1',
  nome: '',
  endereco: '',
}

export default function UnidadesPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [editing, setEditing] = useState<Unit | null>(null)
  const [form, setForm] = useState(EMPTY_UNIT)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setUnits(getUnits())
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_UNIT)
    setShowForm(true)
  }

  function openEdit(unit: Unit) {
    setEditing(unit)
    setForm({
      companyId: unit.companyId,
      nome: unit.nome,
      endereco: unit.endereco,
    })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.nome.trim() || !form.endereco.trim()) return

    const normalizedForm = {
      ...form,
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
    }

    const updated = editing
      ? units.map(unit => unit.id === editing.id ? { ...editing, ...normalizedForm } : unit)
      : [...units, { id: uuid(), ...normalizedForm }]

    saveUnits(updated)
    setUnits(updated)
    setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Unidades</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Cadastro das unidades operacionais da empresa.
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary btn-sm">
          <i className="fas fa-plus" /> Cadastrar Unidade
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>
            {editing ? 'Editar Unidade' : 'Nova Unidade'}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Nome da Unidade *</label>
              <input
                className="form-control"
                required
                value={form.nome}
                onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex.: Matriz, Filial Campinas"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Endereço *</label>
              <input
                className="form-control"
                required
                value={form.endereco}
                onChange={e => setForm(prev => ({ ...prev, endereco: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={handleSave} className="btn btn-primary">
              <i className="fas fa-check" /> Salvar
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Unidade</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Nenhuma unidade cadastrada.
                </td>
              </tr>
            ) : units.map(unit => (
              <tr key={unit.id}>
                <td style={{ fontWeight: 600 }}>{unit.nome}</td>
                <td>{unit.endereco}</td>
                <td>
                  <button onClick={() => openEdit(unit)} className="btn btn-outline btn-sm">
                    <i className="fas fa-pen" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
