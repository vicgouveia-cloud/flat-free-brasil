'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getApplications,
  getOccurrences,
  getOrders,
  getProjects,
  getReadings,
  getTires,
  getVehicles,
} from '@/lib/storage'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    orders: 0,
    tires: 0,
    projects: 0,
    applications: 0,
    readings: 0,
    occurrences: 0,
    vehicles: 0,
    treatedTires: 0,
    tiresWithoutReadings: 0,
  })

  useEffect(() => {
    const tires = getTires()
    const applications = getApplications()
    const readings = getReadings()
    const operatingTires = tires.filter(t => t.status === 'em_operacao')
    const treatedTireIds = new Set(applications.map(a => a.tireId))
    const tireIdsWithReadings = new Set(readings.map(r => r.tireId))

    setStats({
      orders: getOrders().length,
      tires: operatingTires.length,
      projects: getProjects().filter(p => p.status === 'ativo').length,
      applications: applications.length,
      readings: readings.length,
      occurrences: getOccurrences().length,
      vehicles: getVehicles().filter(v => v.status === 'ativo').length,
      treatedTires: operatingTires.filter(t => treatedTireIds.has(t.id)).length,
      tiresWithoutReadings: operatingTires.filter(t => !tireIdsWithReadings.has(t.id)).length,
    })
  }, [])

  const cards = [
    { label: 'Pedidos', value: stats.orders, icon: 'fa-box', href: '/app/pedidos', color: '#3b82f6' },
    { label: 'Projetos Ativos', value: stats.projects, icon: 'fa-flask', href: '/app/projetos', color: '#f59e0b' },
    { label: 'Pneus Acompanhados', value: stats.tires, icon: 'fa-circle-dot', href: '/app/pneus', color: 'var(--color-safety-orange)' },
    { label: 'Aplicações Flat Free', value: stats.applications, icon: 'fa-fill-drip', href: '/app/pneus', color: '#f97316' },
    { label: 'Leituras Registradas', value: stats.readings, icon: 'fa-ruler', href: '/app/leituras', color: '#10b981' },
    { label: 'Ocorrências', value: stats.occurrences, icon: 'fa-triangle-exclamation', href: '/app/ocorrencias', color: '#ef4444' },
    { label: 'Veículos Ativos', value: stats.vehicles, icon: 'fa-truck', href: '/app/veiculos', color: '#8b5cf6' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Painel da Frota</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Acompanhe a operação dos pneus e identifique onde vale aprofundar a análise.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/app/pneus" className="card" style={{ textDecoration: 'none', borderLeft: '4px solid var(--color-safety-orange)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>PNEUS EM OPERAÇÃO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.tires}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{stats.treatedTires} com registro de aplicação Flat Free</div>
        </Link>
        <Link href="/app/leituras" className="card" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>ACOMPANHAMENTO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.readings}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>leituras registradas na base</div>
        </Link>
        <Link href="/app/leituras" className="card" style={{ textDecoration: 'none', borderLeft: stats.tiresWithoutReadings ? '4px solid #f59e0b' : undefined }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>ATENÇÃO DE DADOS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats.tiresWithoutReadings}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>pneus em operação ainda sem leitura</div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {cards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ transition: 'transform 0.15s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', background: `${card.color}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${card.icon}`} style={{ color: card.color }} />
                </div>
                <i className="fas fa-arrow-up-right-from-square" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Montserrat' }}>{card.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: 'rgba(255,92,0,0.05)', border: '1px solid rgba(255,92,0,0.2)', borderRadius: '12px', padding: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--color-safety-orange)' }}>Modo Demonstração</strong> — Todos os dados são fictícios e armazenados localmente no navegador. Ao limpar o cache, os dados retornam ao estado inicial de demonstração.
      </div>
    </div>
  )
}
