import Link from 'next/link'
import HomeNav from '@/components/HomeNav'
import PublicFooter from '@/components/PublicFooter'

export default function AcompanharPneusEOcorrenciasPage() {
  return (
    <>
      <HomeNav />
      <main>
        <article className="section">
          <div className="container" style={{ maxWidth: '820px' }}>
            <span className="section-tag">Operação &amp; prevenção</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.12, margin: '1rem 0' }}>
              Por que acompanhar pneus e ocorrências na operação
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '2rem' }}>
              Um pneu passa por diferentes posições, veículos, leituras, reparos e ciclos de uso. Registrar esses eventos ajuda a transformar uma sequência de ocorrências isoladas em um histórico que pode ser analisado.
            </p>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '.75rem' }}>Ocorrências contam parte da história</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Perfurações, perdas de pressão, reparos, recapagens e mudanças de posição interferem na leitura do desempenho do pneu. Quando esses eventos ficam registrados junto com datas e quilometragem, é possível interpretar melhor o que aconteceu durante o uso.
              </p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '.75rem' }}>Leituras permitem acompanhar evolução</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Sulco, quilometragem e pressão, quando disponíveis, ajudam a observar a evolução do pneu ao longo do tempo. O valor de uma leitura aumenta quando ela pode ser comparada com registros anteriores do mesmo pneu e do mesmo ciclo de uso.
              </p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '.75rem' }}>Posição e veículo também importam</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Um mesmo pneu pode mudar de posição ou de veículo. Manter esse histórico evita que medições sejam analisadas fora de contexto e ajuda a entender em que condição cada trecho de uso aconteceu.
              </p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '.75rem' }}>Tratado e controle precisam de contexto comparável</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                Em testes com Flat Free, separar pneus tratados e pneus de controle permite acompanhar diferenças de ocorrências, desgaste e quilometragem observada. A comparação é mais útil quando os grupos têm registros consistentes e condições de uso conhecidas.
              </p>
            </div>

            <div className="home-tech-journey-cta">
              <div className="home-tech-cta-copy">
                <h4>Tem uma frota?</h4>
                <p>Conheça a jornada de teste, acompanhamento e comparação de pneus com Flat Free.</p>
              </div>
              <div className="home-tech-cta-actions">
                <Link href="/frotas" className="btn btn-primary">
                  Flat Free para frotas
                </Link>
                <Link href="/conteudo" className="btn btn-outline">
                  Ver outros conteúdos
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <PublicFooter />
    </>
  )
}
