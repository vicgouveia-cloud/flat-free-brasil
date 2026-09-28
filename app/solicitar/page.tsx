'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getOrders, saveOrders, uuid } from '@/lib/storage'
import { ozToLiters, ozToBucketsCeil, formatDoses } from '@/lib/dosage'
import type {
  Order,
  OrderItem,
  PendingOrderItem,
  PendingDosageReason,
  OrderDosageSource,
} from '@/lib/types'
import DemoBanner from '@/components/DemoBanner'

interface CalcItem {
  medida: string
  quantidade: number
  doseUnitOz: number | null
  totalOz: number
  pendingReason?: PendingDosageReason
  dosageSource?: OrderDosageSource
  usageClass?: 'light_road' | 'heavy_road' | 'slow_machinery'
  rawCalculatedDose?: number
}

function normalizePendingReason(value: unknown): PendingDosageReason | undefined {
  return value === 'unknown_measure' ||
    value === 'needs_usage_class' ||
    value === 'insufficient_geometry' ||
    value === 'historical_conflict' ||
    value === 'needs_review'
    ? value
    : undefined
}

function normalizeDosageSource(value: unknown): OrderDosageSource | undefined {
  return value === 'table' || value === 'estimated' || value === 'technical'
    ? value
    : undefined
}

function normalizeUsageClass(value: unknown): CalcItem['usageClass'] {
  return value === 'light_road' || value === 'heavy_road' || value === 'slow_machinery'
    ? value
    : undefined
}

function SolicitarForm() {
  const searchParams = useSearchParams()
  const [calcItems, setCalcItems] = useState<CalcItem[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    nomeEmpresa: '', razaoSocial: '', cnpj: '',
    nomeResponsavel: '', email: '', telefone: '',
    endereco: '', cidade: '', estado: '', cep: '',
    observacoes: '',
  })

  useEffect(() => {
    const calc = searchParams.get('calc')
    if (calc) {
      try {
        const raw = JSON.parse(decodeURIComponent(calc))
        const normalized: CalcItem[] = raw.map((item: any) => ({
          medida: String(item.medida || ''),
          quantidade: Number(item.quantidade) || 1,
          doseUnitOz:
            item.doseUnitOz !== undefined
              ? item.doseUnitOz
              : item.appliedDose !== undefined
              ? item.appliedDose
              : item.doseUnit !== undefined
              ? item.doseUnit
              : item.doses !== undefined
              ? item.doses
              : null,
          totalOz:
            item.totalOz !== undefined
              ? Number(item.totalOz) || 0
              : item.lineTotalDoses !== undefined
              ? Number(item.lineTotalDoses) || 0
              : item.totalDoses !== undefined
              ? Number(item.totalDoses) || 0
              : 0,
          pendingReason: normalizePendingReason(item.pendingReason),
          dosageSource: normalizeDosageSource(item.dosageSource),
          usageClass: normalizeUsageClass(item.usageClass),
          rawCalculatedDose:
            Number.isFinite(Number(item.rawCalculatedDose))
              ? Number(item.rawCalculatedDose)
              : undefined,
        }))
        setCalcItems(normalized)
      } catch {}
    }
  }, [searchParams])

  const totalOz = calcItems.reduce((s, i) => s + (i.doseUnitOz !== null ? i.totalOz : 0), 0)

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const itens: OrderItem[] = calcItems
      .filter(i => i.doseUnitOz !== null)
      .map(i => ({
        medida: i.medida,
        quantidade: i.quantidade,
        doseUnitOz: i.doseUnitOz!,
        totalOz: i.totalOz,
        ...(i.dosageSource ? { dosageSource: i.dosageSource } : {}),
        ...(i.dosageSource === 'estimated' && i.usageClass
          ? {
              operationalBasis: {
                method: 'operational_class' as const,
                usageClass: i.usageClass,
                ...(i.rawCalculatedDose !== undefined
                  ? { calculatedDoseBeforeRounding: i.rawCalculatedDose }
                  : {}),
              },
            }
          : {}),
      }))

    const itensPendentes: PendingOrderItem[] = calcItems
      .filter(i => i.doseUnitOz === null)
      .map(i => ({
        medida: i.medida,
        quantidade: i.quantidade,
        status: 'pendente_confirmacao_dosagem',
        ...(i.pendingReason ? { reason: i.pendingReason } : {}),
      }))

    const order: Order = {
      id: uuid(),
      companyId: 'manual',
      data: new Date().toISOString().split('T')[0],
      itens,
      ...(itensPendentes.length > 0 ? { itensPendentes } : {}),
      quantidadeEstimadaProduto: totalOz,
      enderecoEntrega: form.endereco,
      cidade: form.cidade,
      estado: form.estado,
      cep: form.cep,
      nomeEmpresa: form.nomeEmpresa,
      razaoSocial: form.razaoSocial || undefined,
      cnpj: form.cnpj || undefined,
      nomeResponsavel: form.nomeResponsavel,
      email: form.email,
      telefone: form.telefone,
      observacoes: form.observacoes || undefined,
      status: itensPendentes.length > 0 ? 'pendente_dosagem' : 'solicitado',
    }
    const existing = getOrders()
    saveOrders([...existing, order])
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <i className="fas fa-circle-check" style={{ fontSize: '3rem', color: 'var(--color-industrial-lime)', display: 'block', marginBottom: '1rem' }} />
        <h2 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Solicitação registrada!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Modo demonstração: solicitação salva localmente. Em produção, seria enviada ao backend.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/app/pedidos" className="btn btn-primary">Ver Pedidos</Link>
          <Link href="/" className="btn btn-outline">Voltar ao Início</Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {calcItems.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(255,92,0,0.05)', border: '1px solid rgba(255,92,0,0.2)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}><i className="fas fa-calculator" /> Itens da Calculadora</h3>
          <table className="table" style={{ marginBottom: '0.75rem' }}>
            <thead>
              <tr><th>Medida</th><th>Qtd. Pneus</th><th>Por Pneu</th><th>Total</th></tr>
            </thead>
            <tbody>
              {calcItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.medida}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.doseUnitOz !== null ? formatDoses(item.doseUnitOz) : 'Consultar dosagem'}</td>
                  <td>{item.doseUnitOz !== null && item.totalOz > 0 ? formatDoses(item.totalOz) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalOz > 0 && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <strong>Total estimado:</strong> {formatDoses(totalOz)} ≈ {ozToLiters(totalOz).toFixed(1).replace('.', ',')} L —
              {' '}<strong>{ozToBucketsCeil(totalOz)} {ozToBucketsCeil(totalOz) === 1 ? 'balde' : 'baldes'}</strong> para pedido
            </p>
          )}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Dados da Empresa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {([
            ['nomeEmpresa', 'Nome da Empresa *', 'text', true],
            ['razaoSocial', 'Razão Social (opcional)', 'text', false],
            ['cnpj', 'CNPJ (opcional)', 'text', false],
            ['nomeResponsavel', 'Nome do Responsável *', 'text', true],
            ['email', 'E-mail *', 'email', true],
            ['telefone', 'Telefone *', 'tel', true],
          ] as const).map(([field, label, type, req]) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input type={type} className="form-control" required={req}
                value={(form as Record<string, string>)[field]}
                onChange={e => updateForm(field, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Endereço de Entrega</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Endereço *</label>
            <input type="text" className="form-control" required value={form.endereco} onChange={e => updateForm('endereco', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Cidade *</label>
            <input type="text" className="form-control" required value={form.cidade} onChange={e => updateForm('cidade', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Estado *</label>
            <input type="text" className="form-control" required maxLength={2} value={form.estado} onChange={e => updateForm('estado', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">CEP *</label>
            <input type="text" className="form-control" required value={form.cep} onChange={e => updateForm('cep', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Observações</label>
          <textarea className="form-control" rows={4} value={form.observacoes}
            onChange={e => updateForm('observacoes', e.target.value)}
            placeholder="Detalhes adicionais sobre o pedido..." />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
        <i className="fas fa-paper-plane" /> Registrar Solicitação
      </button>
    </form>
  )
}

export default function SolicitarPage() {
  return (
    <>
      <DemoBanner />
      <header style={{ background: '#0a0f1e', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Montserrat', fontWeight: 900, color: '#fff', fontSize: '1.1rem' }}>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></Link>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/calculadora" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>← Calculadora</Link>
            <Link href="/app" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Plataforma</Link>
          </nav>
        </div>
      </header>
      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag">Solicitação de Produto</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Montserrat', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Solicitar Flat Free</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Preencha os dados abaixo para registrar seu pedido/orçamento. Nenhum pagamento é processado nesta etapa.</p>
          </div>
          <Suspense fallback={<div>Carregando...</div>}>
            <SolicitarForm />
          </Suspense>
        </div>
      </main>
    </>
  )
}
