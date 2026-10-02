'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
          <Image src="/images/flat-free-logo.png" alt="Flat Free — início" width={398} height={309} className="home-nav-logo" priority sizes="100px" />
        </Link>

        <nav className={`home-nav-menu${menuOpen ? ' is-open' : ''}`}>
          <Link href="/#inicio" onClick={() => setMenuOpen(false)}>Produto</Link>
          <Link href="/meu-veiculo" onClick={() => setMenuOpen(false)}>Meu veículo</Link>
          <Link href="/frotas" onClick={() => setMenuOpen(false)}>Para frotas</Link>
          <Link href="/conteudo" onClick={() => setMenuOpen(false)}>Conteúdo</Link>
          <Link href="/parceiros" onClick={() => setMenuOpen(false)}>Parceiros</Link>
        </nav>

        <div className="home-nav-actions">
          <button onClick={toggleTheme} className="home-nav-theme" aria-label="Alternar tema">
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
          </button>
          <Link href="/calculadora" className="btn btn-outline home-nav-secondary">
            Calcular Aplicação
          </Link>
          <Link href="/#caminhos" className="btn btn-primary btn-sm">
            Quero Flat Free
          </Link>
          <button className="home-nav-toggle" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>
            <i className={menuOpen ? 'fas fa-xmark' : 'fas fa-bars'} />
          </button>
        </div>
      </div>
    </header>
  )
}
