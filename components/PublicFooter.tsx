import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer style={{ background: '#0a0f1e', color: '#fff', padding: '3rem 0 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container">
        <div className="public-footer-grid" style={{ marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              FLAT <span style={{ color: 'var(--color-safety-orange)' }}>FREE</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              Proteção contra perfurações, preservação da pressão e melhor aproveitamento dos pneus.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link href="/" style={{ color: '#64748b', fontSize: '0.875rem' }}>Início</Link></li>
              <li><Link href="/#produto" style={{ color: '#64748b', fontSize: '0.875rem' }}>Produto</Link></li>
              <li><Link href="/conteudo" style={{ color: '#64748b', fontSize: '0.875rem' }}>Conteúdo</Link></li>
              <li><Link href="/calculadora" style={{ color: '#64748b', fontSize: '0.875rem' }}>Calculadora</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>
              Perfis
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link href="/meu-veiculo" style={{ color: '#64748b', fontSize: '0.875rem' }}>Meu veículo</Link></li>
              <li><Link href="/frotas" style={{ color: '#64748b', fontSize: '0.875rem' }}>Frotas e empresas</Link></li>
              <li><Link href="/parceiros" style={{ color: '#64748b', fontSize: '0.875rem' }}>Revenda e aplicação</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>
              Atendimento
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link href="/solicitar" style={{ color: '#64748b', fontSize: '0.875rem' }}>Falar com a Flat Free</Link></li>
              <li><Link href="/privacidade" style={{ color: '#64748b', fontSize: '0.875rem' }}>Privacidade</Link></li>
              <li><Link href="/termos" style={{ color: '#64748b', fontSize: '0.875rem' }}>Termos de uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="public-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          <span>© 2026 Flat Free Brasil - Todos os direitos reservados.</span>
          <span>flatfreebrasil.com.br</span>
        </div>
      </div>
    </footer>
  )
}
