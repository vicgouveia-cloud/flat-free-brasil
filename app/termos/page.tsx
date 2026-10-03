import type { Metadata } from 'next'
import Link from 'next/link'
import HomeNav from '@/components/HomeNav'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de uso do site Flat Free Brasil, incluindo conteúdo informativo, dosagem e solicitações de atendimento.',
  alternates: { canonical: '/termos' },
}

export default function TermosPage() {
  return (
    <>
      <HomeNav />
      <main className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <span className="section-tag">Termos de uso</span>
          <h1 className="section-title" style={{ marginTop: '.75rem' }}>Termos de Uso</h1>
          <p className="section-description" style={{ margin: '0 0 2rem' }}>
            Ao utilizar este site, você reconhece que o conteúdo tem caráter informativo e que solicitações comerciais dependem de confirmação no atendimento.
          </p>

          <div className="card" style={{ display: 'grid', gap: '1.5rem' }}>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Informações sobre o produto</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                As informações apresentadas descrevem aplicações, características e benefícios do Flat Free. A indicação final deve considerar o tipo de pneu, a medida, a operação e as orientações aplicáveis ao uso do produto.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Calculadora de dosagem</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                A calculadora apresenta doses de referência e, em alguns casos, estimativas ou itens que exigem confirmação técnica. Medidas sinalizadas para revisão não devem ser tratadas como dose confirmada até a validação correspondente.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Solicitações e condições comerciais</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                O envio de um formulário registra interesse em atendimento e não constitui confirmação de venda, preço, estoque, prazo, frete ou condição comercial. Esses pontos são definidos posteriormente entre as partes.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Conteúdo e disponibilidade</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                O conteúdo do site pode ser atualizado para refletir melhorias de produto, documentação, atendimento e funcionalidades. Algumas ferramentas podem estar em evolução e ter sua disponibilidade alterada.
              </p>
            </section>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link href="/privacidade" className="btn btn-outline">Política de Privacidade</Link>
            <Link href="/" className="btn btn-primary">Voltar ao início</Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
