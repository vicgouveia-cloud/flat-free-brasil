import type { Metadata } from 'next'
import Link from 'next/link'
import HomeNav from '@/components/HomeNav'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a Flat Free Brasil trata os dados informados nos formulários de atendimento do site.',
  alternates: { canonical: '/privacidade' },
}

export default function PrivacidadePage() {
  return (
    <>
      <HomeNav />
      <main className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <span className="section-tag">Privacidade</span>
          <h1 className="section-title" style={{ marginTop: '.75rem' }}>Política de Privacidade</h1>
          <p className="section-description" style={{ margin: '0 0 2rem' }}>
            Esta página explica, em linguagem simples, quais informações podem ser fornecidas pelo usuário e como elas são utilizadas no atendimento da Flat Free Brasil.
          </p>

          <div className="card" style={{ display: 'grid', gap: '1.5rem' }}>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Dados que podem ser informados</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Os formulários podem solicitar nome, empresa ou estabelecimento, responsável, e-mail, telefone, cidade, estado e, quando aplicável, razão social, CNPJ, endereço, CEP, informações sobre pneus, medidas, quantidades e observações.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Finalidade do uso</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Essas informações são usadas para responder solicitações, orientar compra ou aplicação, analisar pedidos de fornecimento, apoiar testes em frotas e atender pedidos de acesso às ferramentas de gestão.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Armazenamento e envio</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Parte das informações da solicitação pode ser armazenada localmente no próprio navegador para apoiar o funcionamento da aplicação. O formulário de atendimento também transmite os dados informados para o canal de atendimento da Flat Free Brasil por meio do serviço de formulário utilizado pelo site.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Pagamentos</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                O site não processa pagamentos na etapa de solicitação. Condições comerciais, disponibilidade, entrega e demais detalhes são confirmados no atendimento.
              </p>
            </section>
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>Contato e solicitações</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Para dúvidas sobre o uso dos dados ou para solicitar atendimento relacionado às informações enviadas, utilize o formulário de atendimento disponível no site.
              </p>
            </section>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link href="/solicitar" className="btn btn-primary">Ir para atendimento</Link>
          </div>
        </div>
      </main>
    </>
  )
}
