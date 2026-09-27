'use client'
import { useEffect, useState } from 'react'
import { getTires, saveTires, getApplications, getReadings, uuid } from '@/lib/storage'
import type { Tire, TireCondition, TireStatus } from '@/lib/types'
import { DOSAGE_TABLE } from '@/lib/dosage'

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

export default function PneusPage() {
  const [tires, setTires] = useState<Tire[]>([])
  const [selected, setSelected] = useState<Tire | null>(null)
  const [form, setForm] = useState<Omit<Tire, 'id'>>(EMPTY_TIRE)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tire | null>(null)
  const [applications, setApplications] = useState(getApplications())
  const [readings, setReadings] = useState(getReadings())

  useEffect(() => { setTires(getTires()) }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_TIRE)
    setShowForm(true)
    setSelected(null)
  }

  function openEdit(t: Tire) {
    setEditing(t)
    setForm({ companyId: t.companyId, identificacaoInterna: t.identificacaoInterna, numeroFogo: t.numeroFogo, fabricante: t.fabricante, modelo: t.modelo, medida: t.medida, condicao: t.condicao, custo: t.custo, dataEntradaOperacao: t.dataEntradaOperacao, status: t.status })
    setShowForm(true)
    setSelected(null)
  }

  function handleSave() {
    if (!form.identificacaoInterna || !form.fabricante) return
    let updated: Tire[]
    if (editing) {
      updated = tires.map(t => t.id === editing.id ? { ...editing, ...form } : t)
    } else {
      updated = [...tires, { id: uuid(), ...form }]
    }
    saveTires(updated)
    setTires(updated)
    setShowForm(false)
  }

  const tireReadings = selected ? readings.filter(r => r.tireId === selected.id).sort((a, b) => b.data.localeCompare(a.data)) : []
  const tireApplications = selected ? applications.filter(a => a.tireId === selected.id) : []

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              <label className="form-label">Medida</label>
              <select className="form-control" value={form.medida} onChange={e => setForm(p => ({ ...p, medida: e.target.value }))}>
                {DOSAGE_TABLE.map(d => <option key={d.measure} value={d.measure}>{d.measure}</option>)}
                <option value="outro">Outra medida</option>
              </select>
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
        <div className="card">
          <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}><i className="fas fa-arrow-left" /> Voltar</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800 }}>{selected.identificacaoInterna}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{selected.fabricante} {selected.modelo} — {selected.medida}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge ${statusLabels[selected.status].cls}`}>{statusLabels[selected.status].label}</span>
              <span className="badge badge-gray">{selected.condicao}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              ['Fabricante', selected.fabricante],
              ['Modelo', selected.modelo],
              ['Medida', selected.medida],
              ['Condição', selected.condicao],
              ['Custo', selected.custo ? `R$ ${selected.custo.toLocaleString('pt-BR')}` : '—'],
              ['Entrada op.', selected.dataEntradaOperacao],
              ['Nº Fogo', selected.numeroFogo || '—'],
            ].map(([k, v]) => (
              <div key={k}><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
            ))}
          </div>

          {tireApplications.length > 0 && (
            <>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Aplicação Flat Free</h4>
              <table className="table" style={{ marginBottom: '1.5rem' }}>
                <thead><tr><th>Data</th><th>Doses</th><th>Km Aplicação</th><th>Sulco Inicial</th><th>Responsável</th></tr></thead>
                <tbody>
                  {tireApplications.map(a => (
                    <tr key={a.id}>
                      <td>{a.data}</td>
                      <td>{a.doseAplicada}</td>
                      <td>{a.quilometragemAplicacao.toLocaleString('pt-BR')}</td>
                      <td>{a.sulcoInicial} mm</td>
                      <td>{a.responsavel || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

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
                    <button onClick={() => setSelected(t)} className="btn btn-outline btn-sm">Detalhes</button>
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
