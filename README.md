# Flat Free Brasil — Plataforma MVP

Plataforma web da Flat Free Brasil: site comercial, calculadora de dosagem, solicitação de produto e área de acompanhamento de pneus em projetos piloto.

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Execução Local

```bash
npm run dev
```

Acesse: http://localhost:3000

## Build

```bash
npm run build
```

## Modo Demonstração

Sem credenciais configuradas, a plataforma roda em **modo demonstração**. Todos os dados são fictícios e armazenados no `localStorage` do navegador.

Nenhum dado é enviado a um servidor neste modo.

## Variáveis de Ambiente Futuras

Copie `.env.example` para `.env.local` e preencha as credenciais quando o Supabase estiver configurado:

```bash
cp .env.example .env.local
```

> **Supabase não está conectado.** A plataforma funciona integralmente em modo demo sem nenhuma variável de ambiente.

## Estrutura

```
app/                  # Next.js App Router
  (rotas públicas)    # /, /calculadora, /solicitar
  app/                # /app - Área da plataforma (requer autenticação futura)
lib/                  # Lógica de negócio
  dosage.ts           # Tabela canônica de dosagens
  types.ts            # Interfaces TypeScript
  storage.ts          # Camada de dados (substituível por Supabase)
  demo-data.ts        # Dados de demonstração fictícios
components/           # Componentes reutilizáveis
public/images/        # Assets de imagem
```

## Dosagens Canônicas

| Medida | Doses |
|--------|-------|
| 275/80 R22,5 | 28 |
| 295/80 R22,5 | 34 |

Novas medidas são adicionadas em `lib/dosage.ts`.
