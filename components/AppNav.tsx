'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/app', label: 'Painel', icon: 'fa-gauge' },
  { href: '/app/empresa', label: 'Empresa', icon: 'fa-building' },
  { href: '/app/pedidos', label: 'Pedidos', icon: 'fa-box' },
  { href: '/app/projetos', label: 'Projetos Piloto', icon: 'fa-flask' },
  { href: '/app/veiculos', label: 'Veículos', icon: 'fa-truck' },
  { href: '/app/pneus', label: 'Pneus', icon: 'fa-circle-dot' },
  { href: '/app/leituras', label: 'Leituras', icon: 'fa-ruler' },
  { href: '/app/comparativos', label: 'Comparativos', icon: 'fa-chart-bar' },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <aside className="app-sidebar">
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '1.1rem' }}>
          <span>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></span>
          <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>PLATAFORMA</span>
        </Link>
      </div>
      <nav className="app-nav-section" style={{ paddingTop: '0.5rem' }}>Menu</nav>
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`app-nav-link${pathname === item.href ? ' active' : ''}`}
        >
          <i className={`fas ${item.icon}`} style={{ width: '16px' }} />
          {item.label}
        </Link>
      ))}
      <div style={{ marginTop: '2rem', padding: '0 1.5rem' }}>
        <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ← Voltar ao site
        </Link>
      </div>
    </aside>
  )
}
