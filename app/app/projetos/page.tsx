'use client'
import { useEffect, useState } from 'react'
import { getProjects, saveProjects, getTires, getApplications, getOccurrences, uuid } from '@/lib/storage'
import type { PilotProject, PilotProjectStatus, TireGroup } from '@/lib/types'
import { getApplicationForTireCycleAtDate } from '@/lib/tire-lifecycle'

const statusLabels: Record<PilotProjectStatus, { label: string; cls: string }> = {
  planejamento: { label: 'Planejamento', cls: 'badge-blue' },
  ativo: { label: 'Ativo', cls: 'badge-green' },
  concluido: { label: 'Concluído', cls: 'badge-gray' },
  cancelado: { label: 'Cancelado', cls: 'badge-red' },
}

const today = new Date().toISOString().split('T')[0]

export default function ProjetosPage() {
  const [projects, setProjects] = useState<PilotProject[]>([])
  const [tires, setTires] = useState(getTires())
  const [selected, setSelected] = useState<PilotProject | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', descricao: '', dataInicio: new Date().toISOString().split('T')[0], criterios: '' })
  const [projectTires, setProjectTires] = useState<{ tireId: string; grupo: TireGroup }[]>([])

  useEffect(() => { setProjects(getProjects()); setTires(getTires()) }, [])

  function handleCreate() {
    if (!form.nome) return
    const project: PilotProject = {
      id: uuid(),
      companyId: 'demo-company-1',
      nome: form.nome,
      descricao: form.descricao || undefined,
      dataInicio: form.dataInicio,
      status: 'planejamento',
      criteriosComparacao: form.criterios || undefined,
      pneus: projectTires,
    }
    const updated = [...projects, project]
    saveProjects(updated)
    setProjects(updated)
    setShowForm(false)
    setForm({ nome: '', descricao: '', dataInicio: new Date().toISOString().split('T')[0], criterios: '' })
    setProjectTires([])
  }

  function toggleTire(tireId: string, grupo: TireGroup) {
    setProjectTires(prev => {
      const exists = prev.find(t => t.tireId === tireId)
      if (exists) {
        if (exists.grupo === grupo) return prev.filter(t => t.tireId !== tireId)
        return prev.map(t => t.tireId === tireId ? { ...t, grupo } : t)
      }
      return [...prev, { tireId, grupo }]
    })
  }

  function getTireName(id: string) {
    const t = tires.find(t => t.id === id)
    return t ? `${t.identificacaoInterna} (${t.medida})` : id
  }

  function concludeProject(id: string) {
    const project = projects.find(p => p.id === id)
    if (!project || project.status !== 'ativo') return

    const updated = projects.map(p =>
      p.id === id
        ? { ...p, status: 'concluido' as PilotProjectStatus, dataFim: today }
        : p
    )
    saveProjects(updated)
    setProjects(updated)
    setActivationError(null)
    if (selected?.id === id) setSelected(updated.find(p => p.id === id) || null)
  }

  function activateProject(id: string) {
    const project = projects.find(p => p.id === id)
    if (!project) return

    if (project.dataInicio > today) {
      setActivationError(
        `Este projeto está planejado para iniciar em ${project.dataInicio}. Ele só pode ser ativado nessa data ou depois.`
      )
      return
    }

    const treatedCount = project.pneus.filter(pt => pt.grupo === 'tratado').length
    const controlCount = project.pneus.filter(pt => pt.grupo === 'controle').length

    if (treatedCount === 0 || controlCount === 0) {
      setActivationError(
        'Para ativar o projeto, selecione pelo menos um pneu Tratado e um pneu Controle.'
      )
      return
    }

    const applications = getApplications()
    const occurrences = getOccurrences()
    const applicationInProjectCycle = (tireId: string) =>
      getApplicationForTireCycleAtDate(
        tireId,
        project.dataInicio,
        applications,
        occurrences
      )

    const treatedWithoutApplication = project.pneus.filter(
      pt => pt.grupo === 'tratado' && !applicationInProjectCycle(pt.tireId)
    )
    const controlsWithApplication = project.pneus.filter(
      pt => pt.grupo === 'controle' && Boolean(applicationInProjectCycle(pt.tireId))
    )

    if (treatedWithoutApplication.length > 0 || controlsWithApplication.length > 0) {
      const issues = [
        ...treatedWithoutApplication.map(pt => `${getTireName(pt.tireId)} está no grupo Tratado, mas não possui aplicação Flat Free no ciclo deste projeto.`),
        ...controlsWithApplication.map(pt => `${getTireName(pt.tireId)} está no grupo Controle, mas possui aplicação Flat Free no ciclo deste projeto.`),
      ]
      setActivationError(issues.join(' '))
      return
    }

    const updated = projects.map(p =>
      p.id === id ? { ...p, status: 'ativo' as PilotProjectStatus } : p
    )
    saveProjects(updated)
    setProjects(updated)
    setActivationError(null)
    if (selected?.id === id) setSelected(updated.find(p => p.id === id) || null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Projetos Piloto</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fluxo: Empresa → Projeto → Pneus → Tratado/Controle → Leituras → Comparativo</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><i className="fas fa-plus" /> Novo Projeto</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Novo Projeto Piloto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nome do Projeto *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Descrição</label>
              <textarea className="form-control" rows={2} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Início</label>
              <input type="date" className="form-control" value={form.dataInicio} onChange={e => setForm(p => ({ ...p, dataInicio: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Critérios de Comparação</label>
              <input type="text" className="form-control" placeholder="Ex: Desgaste de sulco, ocorrências" value={form.criterios} onChange={e => setForm(p => ({ ...p, criterios: e.target.value }))} />
            </div>
          </div>

          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Pneus do Projeto</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Selecione cada pneu e defina seu grupo (Tratado com Flat Free ou Controle).</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {tires.map(tire => {
              const assigned = projectTires.find(t => t.tireId === tire.id)
              return (
                <div key={tire.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px' }}>
                  <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>{tire.identificacaoInterna} — {tire.medida}</span>
                  <button
                    onClick={() => toggleTire(tire.id, 'tratado')}
                    className={`btn btn-sm ${assigned?.grupo === 'tratado' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem' }}
                  >Tratado</button>
                  <button
                    onClick={() => toggleTire(tire.id, 'controle')}
                    className={`btn btn-sm ${assigned?.grupo === 'controle' ? '' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem', ...(assigned?.grupo === 'controle' ? { background: '#3b82f6', color: '#fff', border: 'none' } : {}) }}
                  >Controle</button>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleCreate} className="btn btn-primary"><i className="fas fa-check" /> Criar Projeto</button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
          </div>
        </div>
      )}

      {selected ? (
        <div className="card">
          <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}><i className="fas fa-arrow-left" /> Voltar</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800 }}>{selected.nome}</h2>
              {selected.descricao && <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selected.descricao}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${statusLabels[selected.status].cls}`}>{statusLabels[selected.status].label}</span>
              {selected.status === 'planejamento' && (
                <button onClick={() => activateProject(selected.id)} className="btn btn-primary btn-sm">Ativar</button>
              )}
              {selected.status === 'ativo' && (
                <button onClick={() => concludeProject(selected.id)} className="btn btn-outline btn-sm">Concluir</button>
              )}
            </div>
          </div>
          {activationError && selected.status === 'planejamento' && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
              }}
            >
              <strong style={{ color: '#d97706' }}>Antes de ativar:</strong> {activationError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Início</span><span>{selected.dataInicio}</span></div>
            <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Fim</span><span>{selected.dataFim || '—'}</span></div>
            <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Tratados</span><span style={{ fontWeight: 700, color: 'var(--color-safety-orange)' }}>{selected.pneus.filter(p => p.grupo === 'tratado').length} pneus</span></div>
            <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Controle</span><span style={{ fontWeight: 700, color: '#3b82f6' }}>{selected.pneus.filter(p => p.grupo === 'controle').length} pneus</span></div>
          </div>
          {selected.criteriosComparacao && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}><strong>Critérios:</strong> {selected.criteriosComparacao}</p>}
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Pneus</h4>
          <table className="table">
            <thead><tr><th>Pneu</th><th>Grupo</th></tr></thead>
            <tbody>
              {selected.pneus.map((pt, i) => (
                <tr key={i}>
                  <td>{getTireName(pt.tireId)}</td>
                  <td>
                    <span className={`badge ${pt.grupo === 'tratado' ? 'badge-orange' : 'badge-blue'}`}>
                      {pt.grupo === 'tratado' ? 'Tratado com Flat Free' : 'Controle'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Nome</th><th>Início</th><th>Status</th><th>Tratados</th><th>Controle</th><th>Ações</th></tr></thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum projeto criado.</td></tr>
              ) : projects.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.nome}</td>
                  <td>{p.dataInicio}</td>
                  <td><span className={`badge ${statusLabels[p.status].cls}`}>{statusLabels[p.status].label}</span></td>
                  <td>{p.pneus.filter(t => t.grupo === 'tratado').length}</td>
                  <td>{p.pneus.filter(t => t.grupo === 'controle').length}</td>
                  <td>
                    <button
                      onClick={() => {
                        setActivationError(null)
                        setSelected(p)
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Detalhes
                    </button>
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
