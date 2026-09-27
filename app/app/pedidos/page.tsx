'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOrders } from '@/lib/storage'
import { ozToLiters, ozToBucketsCeil, formatDoses } from '@/lib/dosage'
import type { Order } from '@/lib/types'

const statusLabels: Record<string, { label: string; cls: string }> = {
  solicitado: { label: 'Solicitado', cls: 'badge-blue' },
  em_analise: { label: 'Em Análise', cls: 'badge-orange' },
  aprovado: { label: 'Aprovado', cls: 'badge-green' },
  enviado: { label: 'Enviado', cls: 'badge-green' },
  entregue: { label: 'Entregue', cls: 'badge-gray' },
  cancelado: { label: 'Cancelado', cls: 'badge-red' },
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => { setOrders(getOrders()) }, [])

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
                      <td>{item.medida}</td>
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
              <h4 style={{ fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.75rem' }}>
                Itens pendentes de confirmação de dosagem
              </h4>
              <table className="table">
                <thead><tr><th>Medida</th><th>Qtd. Pneus</th><th>Status</th></tr></thead>
                <tbody>
                  {selected.itensPendentes.map((item, i) => (
                    <tr key={i}>
                      <td>{item.medida}</td>
                      <td>{item.quantidade}</td>
                      <td><span className="badge badge-orange">Confirmação de dosagem</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
