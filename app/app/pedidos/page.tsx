'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOrders, saveOrders } from '@/lib/storage'
import {
  calculateDoseFromFormula,
  resolveDosageForApplication,
  roundHalfUp,
  ozToLiters,
  ozToBucketsCeil,
  formatDoseValue,
  formatDoses,
  VEHICLE_USAGE_LABELS,
  type VehicleUsageClass,
} from '@/lib/dosage'
import type { Order, OrderItem, OrderStatus, PendingOrderItem } from '@/lib/types'

const statusLabels: Record<string, { label: string; cls: string }> = {
  pendente_dosagem: { label: 'Pendente de dosagem', cls: 'badge-orange' },
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

interface PendingUsageInput {
  usageClass: '' | VehicleUsageClass
}

function getEffectiveOrderStatus(order: Order): OrderStatus {
  return order.itensPendentes && order.itensPendentes.length > 0
    ? 'pendente_dosagem'
    : order.status
}

const nextStatus: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  solicitado: { status: 'em_analise', label: 'Mover para Em análise' },
  em_analise: { status: 'aprovado', label: 'Aprovar pedido' },
  aprovado: { status: 'enviado', label: 'Marcar como enviado' },
  enviado: { status: 'entregue', label: 'Marcar como entregue' },
}

function canCancelOrder(status: OrderStatus) {
  return status === 'solicitado' || status === 'em_analise' || status === 'aprovado'
}

function getStatusAfterPendingResolution(order: Order, remainingPendingCount: number): Order['status'] {
  if (order.status !== 'pendente_dosagem') return order.status
  return remainingPendingCount > 0 ? 'pendente_dosagem' : 'solicitado'
}

function getPendingReasonText(item: PendingOrderItem) {
  switch (item.reason) {
    case 'historical_conflict':
      return 'Referências históricas divergentes: a dose não foi calculada automaticamente.'
    case 'needs_review':
      return 'Esta medida está marcada para revisão técnica antes da confirmação da dose.'
    case 'needs_usage_class':
      return 'A classe de uso não foi definida na calculadora; confirme tecnicamente antes da aplicação.'
    case 'insufficient_geometry':
      return 'A medida não fornece geometria suficiente para resolver a dosagem automaticamente.'
    case 'unknown_measure':
      return 'A medida não possui referência automática de dosagem.'
    default:
      return 'O motivo original da pendência não foi registrado; confirme tecnicamente a dosagem.'
  }
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [pendingTechnicalInputs, setPendingTechnicalInputs] = useState<Record<number, PendingTechnicalInput>>({})
  const [pendingUsageInputs, setPendingUsageInputs] = useState<Record<number, PendingUsageInput>>({})
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [shippingTrackingCode, setShippingTrackingCode] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')

  useEffect(() => { setOrders(getOrders()) }, [])

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => getEffectiveOrderStatus(order) === statusFilter)

  function updatePendingTechnicalInput<K extends keyof PendingTechnicalInput>(
    index: number,
    field: K,
    value: PendingTechnicalInput[K]
  ) {
    setPendingTechnicalInputs(prev => {
      const current: PendingTechnicalInput = prev[index] || {
        tireHeightInches: '',
        treadWidthInches: '',
        speedRegime: '',
        isOldOrExtremelyWorn: false,
      }

      return {
        ...prev,
        [index]: {
          ...current,
          [field]: value,
        },
      }
    })
  }

  function updatePendingUsageInput(index: number, usageClass: PendingUsageInput['usageClass']) {
    setPendingUsageInputs(prev => ({
      ...prev,
      [index]: { usageClass },
    }))
  }

  function updateOrderStatus(status: OrderStatus, shippingInfo?: Order['shippingInfo']) {
    if (!selected) return

    const effectiveStatus = getEffectiveOrderStatus(selected)
    if (effectiveStatus === 'pendente_dosagem') return

    if (
      status === 'cancelado' &&
      !window.confirm('Cancelar este pedido? Esta ação encerrará o fluxo do pedido.')
    ) return

    const today = new Date().toISOString().split('T')[0]
    const existingHistory = selected.statusHistory || []
    const statusHistory = [
      ...(existingHistory.length > 0
        ? existingHistory
        : [{ status: selected.status, date: selected.data }]),
      { status, date: today },
    ]
    const updatedOrder: Order = {
      ...selected,
      status,
      statusHistory,
      ...(shippingInfo ? { shippingInfo } : {}),
    }
    const updatedOrders = orders.map(order => order.id === updatedOrder.id ? updatedOrder : order)

    saveOrders(updatedOrders)
    setOrders(updatedOrders)
    setSelected(updatedOrder)
    if (status === 'enviado') {
      setShippingCarrier('')
      setShippingTrackingCode('')
    }
  }

  function persistResolvedPending(index: number, resolvedItem: OrderItem) {
    if (!selected?.itensPendentes) return

    const itens: OrderItem[] = [...selected.itens, resolvedItem]
    const itensPendentes = selected.itensPendentes.filter((_, i) => i !== index)
    const quantidadeEstimadaProduto = itens.reduce((sum, item) => sum + item.totalOz, 0)
    const { itensPendentes: _previousPendingItems, ...orderWithoutPendingItems } = selected

    const nextStatus = getStatusAfterPendingResolution(selected, itensPendentes.length)
    const statusChanged = nextStatus !== selected.status
    const today = new Date().toISOString().split('T')[0]
    const updatedOrder: Order = {
      ...orderWithoutPendingItems,
      itens,
      ...(itensPendentes.length > 0 ? { itensPendentes } : {}),
      quantidadeEstimadaProduto,
      status: nextStatus,
      ...(statusChanged
        ? {
            statusHistory: [
              ...(selected.statusHistory && selected.statusHistory.length > 0
                ? selected.statusHistory
                : [{ status: selected.status, date: selected.data }]),
              { status: nextStatus, date: today },
            ],
          }
        : selected.statusHistory
        ? { statusHistory: selected.statusHistory }
        : {}),
    }
    const updatedOrders = orders.map(order => order.id === updatedOrder.id ? updatedOrder : order)

    saveOrders(updatedOrders)
    setOrders(updatedOrders)
    setSelected(updatedOrder)
    setPendingTechnicalInputs({})
    setPendingUsageInputs({})
  }

  function resolvePendingWithUsageClass(index: number) {
    if (!selected?.itensPendentes) return

    const pending = selected.itensPendentes[index]
    const usageClass = pendingUsageInputs[index]?.usageClass
    if (!pending || pending.reason !== 'needs_usage_class' || !usageClass) return

    const resolution = resolveDosageForApplication(pending.medida, usageClass)
    if (resolution.status !== 'resolved' || resolution.source !== 'estimated') return

    persistResolvedPending(index, {
      medida: pending.medida,
      quantidade: pending.quantidade,
      doseUnitOz: resolution.appliedDose,
      totalOz: resolution.appliedDose * pending.quantidade,
      dosageSource: 'estimated',
      operationalBasis: {
        method: 'operational_class',
        usageClass,
        calculatedDoseBeforeRounding: resolution.rawCalculatedDose,
      },
    })
  }

  function resolvePendingWithPhysicalMeasurements(index: number) {
    if (!selected?.itensPendentes) return

    const pending = selected.itensPendentes[index]
    const input = pendingTechnicalInputs[index]
    if (!pending || !input) return

    const speedRegime = input.speedRegime
    if (!speedRegime) return

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
      speedRegime,
      isOldOrExtremelyWorn: input.isOldOrExtremelyWorn,
    })
    const appliedDose = roundHalfUp(calculation.recommendedOunces)
    const totalOz = appliedDose * pending.quantidade

    const resolvedItem: OrderItem = {
      medida: pending.medida,
      quantidade: pending.quantidade,
      doseUnitOz: appliedDose,
      totalOz,
      dosageSource: 'technical',
      technicalBasis: {
        method: 'asi_physical_measurements',
        tireHeightInches,
        treadWidthInches,
        speedRegime,
        isOldOrExtremelyWorn: input.isOldOrExtremelyWorn,
        calculatedDoseBeforeRounding: calculation.recommendedOunces,
      },
    }
    persistResolvedPending(index, resolvedItem)
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
              ['Status', statusLabels[getEffectiveOrderStatus(selected)]?.label || getEffectiveOrderStatus(selected)],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</span>
                <span style={{ fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}
          </div>

          {(() => {
            const effectiveStatus = getEffectiveOrderStatus(selected)
            const next = nextStatus[effectiveStatus]

            if (effectiveStatus === 'pendente_dosagem') {
              return (
                <div
                  style={{
                    marginBottom: '1.25rem',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px solid rgba(249,115,22,0.25)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.825rem',
                  }}
                >
                  O pedido só poderá avançar depois que todas as pendências de dosagem forem resolvidas.
                </div>
              )
            }

            if (!next && !canCancelOrder(effectiveStatus)) return null

            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.25rem',
                  padding: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
                  Atualizar andamento do pedido
                </span>
                {canCancelOrder(effectiveStatus) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => updateOrderStatus('cancelado')}
                  >
                    Cancelar pedido
                  </button>
                )}
                {next && next.status === 'enviado' ? (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={shippingCarrier}
                      onChange={e => setShippingCarrier(e.target.value)}
                      placeholder="Transportadora"
                      aria-label="Transportadora"
                      style={{ maxWidth: '220px' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={shippingTrackingCode}
                      onChange={e => setShippingTrackingCode(e.target.value)}
                      placeholder="Código de rastreio (opcional)"
                      aria-label="Código de rastreio"
                      style={{ maxWidth: '240px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={!shippingCarrier.trim()}
                      style={{
                        opacity: shippingCarrier.trim() ? 1 : 0.5,
                        cursor: shippingCarrier.trim() ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() =>
                        updateOrderStatus('enviado', {
                          carrier: shippingCarrier.trim(),
                          ...(shippingTrackingCode.trim()
                            ? { trackingCode: shippingTrackingCode.trim() }
                            : {}),
                        })
                      }
                    >
                      Marcar como enviado
                    </button>
                  </>
                ) : next ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => updateOrderStatus(next.status)}
                  >
                    {next.label}
                  </button>
                ) : null}
              </div>
            )
          })()}

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
                        {item.dosageSource && (
                          <span
                            className={`badge ${
                              item.dosageSource === 'table'
                                ? 'badge-blue'
                                : item.dosageSource === 'estimated'
                                ? 'badge-orange'
                                : 'badge-gray'
                            }`}
                            style={{ marginLeft: '0.5rem' }}
                          >
                            {item.dosageSource === 'table'
                              ? 'Dose de referência'
                              : item.dosageSource === 'estimated'
                              ? 'Dose estimada'
                              : 'Dose técnica'}
                          </span>
                        )}
                        {item.operationalBasis && (
                          <details style={{ marginTop: '0.25rem' }}>
                            <summary
                              style={{
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              Base técnica por classe operacional
                            </summary>
                            <div
                              style={{
                                marginTop: '0.35rem',
                                fontSize: '0.72rem',
                                lineHeight: 1.5,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <div>Classe: {VEHICLE_USAGE_LABELS[item.operationalBasis.usageClass]}</div>
                              {item.operationalBasis.calculatedDoseBeforeRounding !== undefined && (
                                <div>
                                  Resultado antes do arredondamento:{' '}
                                  {formatDoseValue(item.operationalBasis.calculatedDoseBeforeRounding)} doses
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                        {item.technicalBasis && (
                          <details style={{ marginTop: '0.25rem' }}>
                            <summary
                              style={{
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              Base técnica por medidas físicas reais
                            </summary>
                            <div
                              style={{
                                marginTop: '0.35rem',
                                fontSize: '0.72rem',
                                lineHeight: 1.5,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <div>Altura física total: {item.technicalBasis.tireHeightInches.toString().replace('.', ',')} pol</div>
                              <div>Largura real da banda: {item.technicalBasis.treadWidthInches.toString().replace('.', ',')} pol</div>
                              <div>
                                Regime operacional:{' '}
                                {item.technicalBasis.speedRegime === 'over_45_mph'
                                  ? 'acima de 72 km/h'
                                  : 'até 72 km/h / veículo lento'}
                              </div>
                              <div>
                                Ajuste por desgaste:{' '}
                                {item.technicalBasis.isOldOrExtremelyWorn ? 'aplicado' : 'não aplicado'}
                              </div>
                              <div>
                                Resultado antes do arredondamento:{' '}
                                {formatDoseValue(item.technicalBasis.calculatedDoseBeforeRounding)} doses
                              </div>
                            </div>
                          </details>
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
                {selected.itensPendentes && selected.itensPendentes.length > 0 ? 'Total parcial' : 'Total'}:{' '}
                {formatDoses(selected.quantidadeEstimadaProduto)}
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
                Cada item mantém o motivo que impediu o cálculo automático. Quando faltar apenas a classe de uso,
                selecione a classe operacional. Nos demais casos, confirme pela medição física real da altura total
                e da largura da banda de rodagem; não use a largura nominal da lateral.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selected.itensPendentes.map((item, i) => {
                  const input = pendingTechnicalInputs[i] || {
                    tireHeightInches: '',
                    treadWidthInches: '',
                    speedRegime: '',
                    isOldOrExtremelyWorn: false,
                  }

                  const requiresUsageClass = item.reason === 'needs_usage_class'
                  const usageInput = pendingUsageInputs[i] || { usageClass: '' }

                  return (
                    <form
                      key={i}
                      onSubmit={e => {
                        e.preventDefault()
                        if (requiresUsageClass) {
                          resolvePendingWithUsageClass(i)
                        } else {
                          resolvePendingWithPhysicalMeasurements(i)
                        }
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
                          <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                            {getPendingReasonText(item)}
                          </div>
                        </div>
                        <span className="badge badge-orange">
                          {item.reason === 'historical_conflict'
                            ? 'Conflito histórico'
                            : item.reason === 'needs_usage_class'
                            ? 'Aguardando classe de uso'
                            : 'Aguardando dados técnicos'}
                        </span>
                      </div>

                      {requiresUsageClass ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'end',
                            gap: '0.75rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: '260px' }}>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>
                              Classe de uso do veículo
                            </label>
                            <select
                              required
                              className="form-control"
                              value={usageInput.usageClass}
                              onChange={e =>
                                updatePendingUsageInput(
                                  i,
                                  e.target.value as PendingUsageInput['usageClass']
                                )
                              }
                            >
                              <option value="">Selecione...</option>
                              <option value="light_road">{VEHICLE_USAGE_LABELS.light_road}</option>
                              <option value="heavy_road">{VEHICLE_USAGE_LABELS.heavy_road}</option>
                              <option value="slow_machinery">{VEHICLE_USAGE_LABELS.slow_machinery}</option>
                            </select>
                          </div>
                          <button type="submit" className="btn btn-primary btn-sm">
                            Calcular e confirmar dosagem
                          </button>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </form>
                  )
                })}
              </div>
            </>
          )}
          {selected.statusHistory && selected.statusHistory.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Histórico do pedido</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selected.statusHistory.map((entry, i) => (
                  <div
                    key={`${entry.status}-${entry.date}-${i}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>{statusLabels[entry.status]?.label || entry.status}</span>
                    <span>{entry.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selected.shippingInfo && (
            <div style={{ marginTop: '1.25rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.45rem' }}>Envio</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', margin: 0 }}>
                <strong>Transportadora:</strong> {selected.shippingInfo.carrier}
                {selected.shippingInfo.trackingCode && (
                  <>
                    {' '}• <strong>Rastreio:</strong> {selected.shippingInfo.trackingCode}
                  </>
                )}
              </p>
            </div>
          )}
          {selected.observacoes && (
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}><strong>Observações:</strong> {selected.observacoes}</p>
          )}
        </div>
      ) : (
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Filtrar pedidos por status
            </span>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | OrderStatus)}
              style={{ width: 'auto', minWidth: '210px' }}
            >
              <option value="all">Todos os status</option>
              <option value="pendente_dosagem">Pendente de dosagem</option>
              <option value="solicitado">Solicitado</option>
              <option value="em_analise">Em análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="enviado">Enviado</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <table className="table">
            <thead><tr><th>Empresa</th><th>Data</th><th>Total (doses)</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    {orders.length === 0 ? 'Nenhum pedido registrado.' : 'Nenhum pedido neste status.'}
                  </td>
                </tr>
              ) : filteredOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.nomeEmpresa}</td>
                  <td>{o.data}</td>
                  <td>
                    {o.quantidadeEstimadaProduto > 0 ? (
                      <>
                        {formatDoses(o.quantidadeEstimadaProduto)}
                        {o.itensPendentes && o.itensPendentes.length > 0 && (
                          <span style={{ marginLeft: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            (parcial)
                          </span>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td>
                    {(() => {
                      const status = getEffectiveOrderStatus(o)
                      return <span className={`badge ${statusLabels[status]?.cls || 'badge-gray'}`}>{statusLabels[status]?.label || status}</span>
                    })()}
                  </td>
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
