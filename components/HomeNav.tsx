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
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 900 }}>
          <span>FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span></span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', opacity: 0.7 }}>B2B Heavy Duty</span>
        </Link>

        <nav style={{ display: menuOpen ? 'flex' : undefined, gap: '0.25rem' }}>
          <a href="#inicio" style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Início</a>
          <a href="#tecnologia" style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Tecnologia 3D</a>
          <a href="#beneficios" style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Benefícios</a>
          <a href="#calculadora" style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Calculadora ROI</a>
          <a href="#artigos" style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Artigos</a>
          <a href="#contato" style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Contato</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1rem' }}>
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
          </button>
          <Link href="/calculadora" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', borderColor: 'var(--color-industrial-lime)', color: 'var(--color-industrial-lime)' }}>
            Calcular Aplicação
          </Link>
          <Link href="/solicitar" className="btn btn-primary btn-sm">
            Solicitar Flat Free
          </Link>
          <Link href="/app" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            Plataforma
          </Link>
        </div>
      </div>
    </header>
  )
}
