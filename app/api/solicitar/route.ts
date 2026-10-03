import { NextResponse } from 'next/server'

const contactEmail = process.env.CONTACT_TO_EMAIL ?? 'contato@flatfreebrasil.com.br'
const contactFrom = process.env.CONTACT_FROM_EMAIL ?? 'Flat Free Brasil <contato@flatfreebrasil.com.br>'

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

    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !telefone || !cidade || !estado) {
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

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'Atendimento por e-mail indisponível no momento.' },
        { status: 503 }
      )
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: contactFrom,
        to: [contactEmail],
        reply_to: email,
        subject: '[FLAT FREE] Novo interesse pelo site',
        text: Object.entries(payload).map(([key, value]) => `${key}: ${value}`).join('\n'),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
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
