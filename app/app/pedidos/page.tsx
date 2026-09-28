'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOrders, saveOrders } from '@/lib/storage'
import { calculateDoseFromFormula, roundHalfUp, ozToLiters, ozToBucketsCeil, formatDoses } from '@/lib/dosage'
import type { Order } from '@/lib/types'

const statusLabels: Record<string, { label: string; cls: string }> = {
  solicitado: { label: 'Solicitado', cls: 'badge-blue' },
  em_analise: { label: 'Em Análise', cls: 'badge-orange' },
  aprovado: { label: 'Aprovado', cls: 'badge-green' },
  enviado: { label: 'Enviado', cls: 'badge-green' },
  entregue: { label: 'Entregue', cls: 'badge-gray' },
  cancelado: { label: 'Cancelado', cls: 'badge-red' },
}

interface PendingTechnicalInput {
  tireHeightInches: string
  treadWidthInches: string
  speedRegime: '' | 'over_45_mph' | 'under_45_mph'
  isOldOrExtremelyWorn: boolean
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [pendingTechnicalInputs, setPendingTechnicalInputs] = useState<Record<number, PendingTechnicalInput>>({})

  useEffect(() => { setOrders(getOrders()) }, [])

  function updatePendingTechnicalInput(
    index: number,
    field: keyof PendingTechnicalInput,
    value: string | boolean
  ) {
    setPendingTechnicalInputs(prev => ({
      ...prev,
      [index]: {
        tireHeightInches: '',
        treadWidthInches: '',
        speedRegime: '',
        isOldOrExtremelyWorn: false,
        ...prev[index],
        [field]: value,
      },
    }))
  }

  function resolvePendingWithPhysicalMeasurements(index: number) {
    if (!selected?.itensPendentes) return

    const pending = selected.itensPendentes[index]
    const input = pendingTechnicalInputs[index]
    if (!pending || !input || !input.speedRegime) return

    const tireHeightInches = Number(input.tireHeightInches)
    const treadWidthInches = Number(input.treadWidthInches)

    if (
      !Number.isFinite(tireHeightInches) ||
      !Number.isFinite(treadWidthInches) ||
      tireHeightInches <= 0 ||
      treadWidthInches <= 0
    ) return

    const calculation = calculateDoseFromFormula({
      tireHeightInches,
      treadWidthInches,
      speedRegime: input.speedRegime,
      isOldOrExtremelyWorn: input.isOldOrExtremelyWorn,
    })
    const appliedDose = roundHalfUp(calculation.recommendedOunces)
    const totalOz = appliedDose * pending.quantidade

    const itens = [
      ...selected.itens,
      {
        medida: pending.medida,
        quantidade: pending.quantidade,
        doseUnitOz: appliedDose,
        totalOz,
        technicalBasis: {
          method: 'asi_physical_measurements' as const,
          tireHeightInches,
          treadWidthInches,
          speedRegime: input.speedRegime,
          isOldOrExtremelyWorn: input.isOldOrExtremelyWorn,
          calculatedDoseBeforeRounding: calculation.recommendedOunces,
        },
      },
    ]
    const itensPendentes = selected.itensPendentes.filter((_, i) => i !== index)
    const quantidadeEstimadaProduto = itens.reduce((sum, item) => sum + item.totalOz, 0)

    const updatedOrder: Order = {
      ...selected,
      itens,
      itensPendentes: itensPendentes.length > 0 ? itensPendentes : undefined,
      quantidadeEstimadaProduto,
    }
    const updatedOrders = orders.map(order => order.id === updatedOrder.id ? updatedOrder : order)

    saveOrders(updatedOrders)
    setOrders(updatedOrders)
    setSelected(updatedOrder)
    setPendingTechnicalInputs({})
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Pedidos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Solicitações de produto registradas.</p>
        </div>
        <Link href="/solicitar" className="btn btn-primary btn-sm"><i className="fas fa-plus" /> Nova Solicitação</Link>
      </div>

      {selected ? (
        <div className="card">
          <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}><i className="fas fa-arrow-left" /> Voltar</button>
          <h2 style={{ fontWeight: 800, marginBottom: '1rem' }}>{selected.nomeEmpresa}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              ['Responsável', selected.nomeResponsavel],
              ['E-mail', selected.email],
              ['Telefone', selected.telefone],
              ['Data', selected.data],
              ['Endereço', `${selected.enderecoEntrega}, ${selected.cidade}/${selected.estado} - ${selected.cep}`],
              ['Status', selected.status],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</span>
                <span style={{ fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}
          </div>
          {selected.itens.length > 0 && (
            <>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Itens</h4>
              <table className="table">
                <thead><tr><th>Medida</th><th>Qtd. Pneus</th><th>Por Pneu</th><th>Total Item</th></tr></thead>
                <tbody>
                  {selected.itens.map((item, i) => (
                    <tr key={i}>
                      <td>
                        {item.medida}
                        {item.technicalBasis && (
                          <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Calculada por medidas físicas reais
                          </div>
                        )}
                      </td>
                      <td>{item.quantidade}</td>
                      <td>{formatDoses(item.doseUnitOz)}</td>
                      <td>{formatDoses(item.totalOz)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: '0.75rem', fontWeight: 700, color: 'var(--color-safety-orange)' }}>
                Total: {formatDoses(selected.quantidadeEstimadaProduto)}
                {' '}≈ {ozToLiters(selected.quantidadeEstimadaProduto).toFixed(1).replace('.', ',')} L
                {' '}— {ozToBucketsCeil(selected.quantidadeEstimadaProduto)} {ozToBucketsCeil(selected.quantidadeEstimadaProduto) === 1 ? 'balde' : 'baldes'}
              </p>
            </>
          )}
          {selected.itensPendentes && selected.itensPendentes.length > 0 && (
            <>
              <h4 style={{ fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.4rem' }}>
                Itens pendentes de confirmação de dosagem
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.85rem' }}>
                Para medidas sem geometria suficiente no código do pneu, a dosagem só pode ser calculada com
                medidas físicas reais. Não use largura nominal da lateral nem informe uma dose manualmente.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selected.itensPendentes.map((item, i) => {
                  const input = pendingTechnicalInputs[i] || {
                    tireHeightInches: '',
                    treadWidthInches: '',
                    speedRegime: '',
                    isOldOrExtremelyWorn: false,
                  }

                  return (
                    <form
                      key={i}
                      onSubmit={e => {
                        e.preventDefault()
                        resolvePendingWithPhysicalMeasurements(i)
                      }}
                      style={{
                        padding: '0.85rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--bg-surface)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.8rem',
                        }}
                      >
                        <div>
                          <strong>{item.medida}</strong>
                          <span style={{ marginLeft: '0.6rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {item.quantidade} {item.quantidade === 1 ? 'pneu' : 'pneus'}
                          </span>
                        </div>
                        <span className="badge badge-orange">Aguardando dados técnicos</span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '0.75rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Altura física total (pol)
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="80"
                            step="0.1"
                            required
                            className="form-control"
                            value={input.tireHeightInches}
                            onChange={e => updatePendingTechnicalInput(i, 'tireHeightInches', e.target.value)}
                            placeholder="Medida real"
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Largura real da banda (pol)
                          </label>
                          <input
                            type="number"
                            min="2"
                            max="40"
                            step="0.1"
                            required
                            className="form-control"
                            value={input.treadWidthInches}
                            onChange={e => updatePendingTechnicalInput(i, 'treadWidthInches', e.target.value)}
                            placeholder="Área de contato"
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Regime operacional
                          </label>
                          <select
                            required
                            className="form-control"
                            value={input.speedRegime}
                            onChange={e =>
                              updatePendingTechnicalInput(
                                i,
                                'speedRegime',
                                e.target.value as PendingTechnicalInput['speedRegime']
                              )
                            }
                          >
                            <option value="">Selecione...</option>
                            <option value="over_45_mph">Acima de 72 km/h</option>
                            <option value="under_45_mph">Até 72 km/h / veículo lento</option>
                          </select>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={input.isOldOrExtremelyWorn}
                            onChange={e =>
                              updatePendingTechnicalInput(i, 'isOldOrExtremelyWorn', e.target.checked)
                            }
                          />
                          Pneu antigo ou excessivamente desgastado
                        </label>
                        <button type="submit" className="btn btn-primary btn-sm">
                          Calcular e confirmar dosagem
                        </button>
                      </div>
                    </form>
                  )
                })}
              </div>
            </>
          )}
          {selected.observacoes && (
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}><strong>Observações:</strong> {selected.observacoes}</p>
          )}
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Empresa</th><th>Data</th><th>Total (doses)</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhum pedido registrado.</td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.nomeEmpresa}</td>
                  <td>{o.data}</td>
                  <td>{o.quantidadeEstimadaProduto > 0 ? formatDoses(o.quantidadeEstimadaProduto) : '—'}</td>
                  <td><span className={`badge ${statusLabels[o.status]?.cls || 'badge-gray'}`}>{statusLabels[o.status]?.label || o.status}</span></td>
                  <td><button onClick={() => setSelected(o)} className="btn btn-outline btn-sm">Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
