'use client'

import { useEffect, useState } from 'react'
import { getCompany, saveCompany } from '@/lib/storage'
import type { Company } from '@/lib/types'

const EMPTY_COMPANY: Company = {
  id: 'demo-company-1',
  nome: '',
  razaoSocial: '',
  cnpj: '',
  contatoPrincipal: '',
  email: '',
  telefone: '',
  endereco: '',
}

export default function EmpresaPage() {
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setCompany(getCompany())
  }, [])

  function updateField(field: keyof Omit<Company, 'id'>, value: string) {
    setCompany(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (
      !company.nome.trim() ||
      !company.contatoPrincipal.trim() ||
      !company.email.trim() ||
      !company.telefone.trim() ||
      !company.endereco.trim()
    ) return

    saveCompany(company)
    setSaved(true)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Empresa</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Dados cadastrais da empresa responsável pela frota acompanhada.
        </p>
      </div>

      <form onSubmit={handleSave} className="card">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="form-group">
            <label className="form-label">Nome da Empresa *</label>
            <input
              className="form-control"
              required
              value={company.nome}
              onChange={e => updateField('nome', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Razão Social</label>
            <input
              className="form-control"
              value={company.razaoSocial || ''}
              onChange={e => updateField('razaoSocial', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input
              className="form-control"
              value={company.cnpj || ''}
              onChange={e => updateField('cnpj', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contato Principal *</label>
            <input
              className="form-control"
              required
              value={company.contatoPrincipal}
              onChange={e => updateField('contatoPrincipal', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input
              type="email"
              className="form-control"
              required
              value={company.email}
              onChange={e => updateField('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone *</label>
            <input
              className="form-control"
              required
              value={company.telefone}
              onChange={e => updateField('telefone', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Endereço *</label>
            <input
              className="form-control"
              required
              value={company.endereco}
              onChange={e => updateField('endereco', e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-check" /> Salvar dados da empresa
          </button>
          {saved && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Dados salvos neste navegador.
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
