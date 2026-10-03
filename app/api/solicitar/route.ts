import { NextResponse } from 'next/server'

const contactEmail = process.env.CONTACT_TO_EMAIL ?? 'vicgouveia@gmail.com'

function asText(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (asText(body.website, 200)) {
      return NextResponse.json({ ok: true })
    }

    const nome = asText(body.Nome_ou_empresa, 160)
    const email = asText(body.Email, 200)
    const telefone = asText(body.Telefone, 80)
    const cidade = asText(body.Cidade, 120)
    const estado = asText(body.Estado, 2)

    if (!nome || !email || !telefone || !cidade || !estado) {
      return NextResponse.json(
        { ok: false, error: 'Campos obrigatórios ausentes.' },
        { status: 400 }
      )
    }

    const payload = {
      _subject: '[FLAT FREE] Novo interesse pelo site',
      _template: 'table',
      Perfil: asText(body.Perfil, 120),
      Interesse_inicial: asText(body.Interesse_inicial, 180),
      Nome_ou_empresa: nome,
      Razao_social: asText(body.Razao_social, 180) || 'Não informado',
      CNPJ: asText(body.CNPJ, 40) || 'Não informado',
      Responsavel: asText(body.Responsavel, 160),
      Email: email,
      Telefone: telefone,
      Cidade: cidade,
      Estado: estado,
      Endereco: asText(body.Endereco, 240) || 'Não informado',
      CEP: asText(body.CEP, 30) || 'Não informado',
      Itens_calculados: asText(body.Itens_calculados, 1200) || 'Nenhum',
      Quantidade_referencia_oz: asText(String(body.Quantidade_referencia_oz ?? ''), 80) || 'Não calculada',
      Observacoes: asText(body.Observacoes, 2000) || 'Sem observações',
    }

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(contactEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: 'Falha no encaminhamento do atendimento.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Não foi possível processar a solicitação.' },
      { status: 500 }
    )
  }
}
