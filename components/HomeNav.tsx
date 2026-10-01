'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('flat_free_theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('flat_free_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'var(--bg-surface)' : 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        transition: 'all 0.3s',
      }}
    >
      <div className="container home-nav-inner">
        <Link href="/" className="home-nav-brand">
          <span>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', opacity: 0.7 }}>Proteção &amp; Gestão de Pneus</span>
        </Link>

        <nav className={`home-nav-menu${menuOpen ? ' is-open' : ''}`}>
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a>
          <a href="#tecnologia" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#beneficios" onClick={() => setMenuOpen(false)}>Benefícios</a>
          <Link href="/calculadora" onClick={() => setMenuOpen(false)}>Dosagem</Link>
          <Link href="/app" onClick={() => setMenuOpen(false)}>Para frotas</Link>
          <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
        </nav>

        <div className="home-nav-actions">
          <button onClick={toggleTheme} className="home-nav-theme" aria-label="Alternar tema">
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
          </button>
          <Link href="/calculadora" className="btn btn-outline home-nav-secondary">
            Calcular Aplicação
          </Link>
          <Link href="/solicitar" className="btn btn-primary btn-sm">
            Quero Flat Free
          </Link>
          <Link href="/app" className="btn btn-sm home-nav-fleet">
            Gestão da Frota
          </Link>
          <button className="home-nav-toggle" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>
            <i className={menuOpen ? 'fas fa-xmark' : 'fas fa-bars'} />
          </button>
        </div>
      </div>
    </header>
  )
}