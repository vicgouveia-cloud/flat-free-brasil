import Link from 'next/link'
import HomeNav from '@/components/HomeNav'
import PublicFooter from '@/components/PublicFooter'

export default function NotFound() {
  return (
    <>
      <HomeNav />
      <main className="section">
        <div className="container" style={{ maxWidth: '720px', textAlign: 'center' }}>
          <span className="section-tag">404</span>
          <h1 className="section-title" style={{ marginTop: '.75rem' }}>Página não encontrada</h1>
          <p className="section-description" style={{ marginBottom: '1.75rem' }}>
            O endereço acessado não existe ou pode ter sido alterado. Você pode voltar ao início ou seguir para uma das áreas principais do site.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">Voltar ao início</Link>
            <Link href="/conteudo" className="btn btn-outline">Ver conteúdo</Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
