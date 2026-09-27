// ============================================================================
// FLAT FREE BRASIL — CATÁLOGO CANÔNICO DE DOSAGEM
// Fonte: Acervo documental histórico (ASI Chemical Inc. / Revix Imp. Exp.)
//
// Documentos auditados:
// - Tire Chart.pdf (ASI Chemical Inc., Lake Wales, FL)
// - Tabela Resumida Veículos.pdf & .docx (Revix / Flat Free)
// - Quantidade-Montadoras.xlsx (Sheet2 e tabelas de montadoras)
// - QUANTIDADES MONTADORAS/DOSAGEM.xls (VW, GM, Fiat, Kia, Mitsubishi, Renault)
// - QUANTIDADES MONTADORAS/Doses *.pdf (Fiat, Ford, GM, Kia, Mitsubishi, Renault, VW)
// - Tabela de aplicação passeio.pdf & tabela aplicação passeio exel.xlsx
// - Tabela de Custo por Produto.xls (balde 5 gal US = 640 fl oz ≈ 18,9 L)
// ============================================================================

export type TechnicalStatus = 'confirmed' | 'historical_conflict' | 'needs_review'
export type TireCategory = 'passeio_leve' | 'caminhao_onibus' | 'trator_maquinario'

export interface DosageCatalogEntry {
  /** Medida normalizada canônica do pneu (ex.: '295/80 R22,5') */
  canonicalMeasure: string
  /** Grafias alternativas equivalentes */
  aliases: string[]
  /** Categoria técnica do veículo sustentada documentalmente */
  category: TireCategory
  /** Dosagem em onças fluidas americanas (US fl oz) por pneu */
  fluidOzPerTire: number
  /** Fonte documental de procedência */
  source: string
  /** confirmed: sem divergência no acervo consultado; não implica validação atual do fabricante. */
  status: TechnicalStatus
  /** Observações detalhadas sobre divergências ou contexto histórico */
  divergenceNotes?: string
}

export const DOSAGE_CATALOG: DosageCatalogEntry[] = [
  {
    "canonicalMeasure": "10.00 R20",
    "aliases": [
      "10,00 R20",
      "10,00 r20",
      "10,00/20",
      "10,00R20",
      "10,00r20",
      "10.00 R20",
      "10.00 r20",
      "10.00/20",
      "10.00R20",
      "10.00r20"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 32.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "11.00 R20",
    "aliases": [
      "11,00 R20",
      "11,00 r20",
      "11,00/20",
      "11,00R20",
      "11,00r20",
      "11.00 R20",
      "11.00 r20",
      "11.00/20",
      "11.00R20",
      "11.00r20"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 36.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "12,5L R15",
    "aliases": [
      "12,5L R15",
      "12,5L/15",
      "12,5LR15",
      "12,5l r15",
      "12,5l/15",
      "12,5lr15",
      "12.5L R15",
      "12.5L/15",
      "12.5LR15",
      "12.5l r15",
      "12.5l/15",
      "12.5lr15"
    ],
    "category": "trator_maquinario",
    "fluidOzPerTire": 70.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "16.7 R20",
    "aliases": [
      "16,7 R20",
      "16,7 r20",
      "16,7/20",
      "16,7R20",
      "16,7r20",
      "16.7 R20",
      "16.7 r20",
      "16.7/20",
      "16.7R20",
      "16.7r20"
    ],
    "category": "trator_maquinario",
    "fluidOzPerTire": 80.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "165/60 R14",
    "aliases": [
      "165 / 60 R14",
      "165 / 60 r14",
      "165/60 R14",
      "165/60 r14",
      "165/60/14",
      "165/60R14",
      "165/60r14"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 7.0,
    "source": "DOSAGEM.xls / Doses Kia.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "165/70 R13",
    "aliases": [
      "165 / 70 R13",
      "165 / 70 r13",
      "165/70 R13",
      "165/70 r13",
      "165/70/13",
      "165/70R13",
      "165/70r13"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 6.5,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 7.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 13), 7.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Celta), 7.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Classic), 6.5 fl oz (Doses Ford.pdf - Ford Ka (ant.)), 7.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Uno Mille). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "17,5 R25",
    "aliases": [
      "17,5 R25",
      "17,5 r25",
      "17,5/25",
      "17,5R25",
      "17,5r25",
      "17.5 R25",
      "17.5 r25",
      "17.5/25",
      "17.5R25",
      "17.5r25"
    ],
    "category": "trator_maquinario",
    "fluidOzPerTire": 200.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "175/60 R14",
    "aliases": [
      "175 / 60 R14",
      "175 / 60 r14",
      "175/60 R14",
      "175/60 r14",
      "175/60/14",
      "175/60R14",
      "175/60r14"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 7.0,
    "source": "DOSAGEM.xls / Doses Renault.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "175/65 R14",
    "aliases": [
      "175 / 65 R14",
      "175 / 65 r14",
      "175/65 R14",
      "175/65 r14",
      "175/65/14",
      "175/65R14",
      "175/65r14"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 7.0,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 7.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 14), 7.5 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Corsa), 7.5 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Prisma), 7.0 fl oz (Doses Ford.pdf - Ford Fiesta), 7.0 fl oz (Doses Ford.pdf - Ford Ka), 7.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Palio), 7.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Siena). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "175/70 R14",
    "aliases": [
      "175 / 70 R14",
      "175 / 70 r14",
      "175/70 R14",
      "175/70 r14",
      "175/70/14",
      "175/70R14",
      "175/70r14"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 7.0,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 7.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 14), 8.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Montana), 7.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Gol), 7.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Saveiro Trend), 7.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Voyage), 7.5 fl oz (Doses Ford.pdf - Ford Courrier), 8.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Strada). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "185/55 R15",
    "aliases": [
      "185 / 55 R15",
      "185 / 55 r15",
      "185/55 R15",
      "185/55 r15",
      "185/55/15",
      "185/55R15",
      "185/55r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "185/60 R15",
    "aliases": [
      "185 / 60 R15",
      "185 / 60 r15",
      "185/60 R15",
      "185/60 r15",
      "185/60/15",
      "185/60R15",
      "185/60r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "185/65 R14",
    "aliases": [
      "185 / 65 R14",
      "185 / 65 r14",
      "185/65 R14",
      "185/65 r14",
      "185/65/14",
      "185/65R14",
      "185/65r14"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "185/65 R15",
    "aliases": [
      "185 / 65 R15",
      "185 / 65 r15",
      "185/65 R15",
      "185/65 r15",
      "185/65/15",
      "185/65R15",
      "185/65r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.5,
    "source": "Quantidade-Montadoras (Peugeot)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "185/70 R14",
    "aliases": [
      "185 / 70 R14",
      "185 / 70 r14",
      "185/70 R14",
      "185/70 r14",
      "185/70/14",
      "185/70R14",
      "185/70r14"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "DOSAGEM.xls / Doses Renault.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "195/55 R15",
    "aliases": [
      "195 / 55 R15",
      "195 / 55 r15",
      "195/55 R15",
      "195/55 r15",
      "195/55/15",
      "195/55R15",
      "195/55r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 8.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 15), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Fox iMotion), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Spacefox), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Voyage Comfortline), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Gol Power), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Polo), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Spacefox). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "195/55 R16",
    "aliases": [
      "195 / 55 R16",
      "195 / 55 r16",
      "195/55 R16",
      "195/55 r16",
      "195/55/16",
      "195/55R16",
      "195/55r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 9.0,
    "source": "Quantidade-Montadoras (Citroen)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "195/60 R15",
    "aliases": [
      "195 / 60 R15",
      "195 / 60 r15",
      "195/60 R15",
      "195/60 r15",
      "195/60/15",
      "195/60R15",
      "195/60r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.5,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 9.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 15), 8.5 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Meriva), 9.0 fl oz (DOSAGEM.xls / Doses Renault.pdf - Renault Sandero Stepway), 9.0 fl oz (Doses Ford.pdf - Ford New Fiesta SD), 9.0 fl oz (Doses Ford.pdf - Ford Focus Antigo), 9.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Idea). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "195/65 R15",
    "aliases": [
      "195 / 65 R15",
      "195 / 65 r15",
      "195/65 R15",
      "195/65 r15",
      "195/65/15",
      "195/65R15",
      "195/65r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 9.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/55 R15",
    "aliases": [
      "205 / 55 R15",
      "205 / 55 r15",
      "205/55 R15",
      "205/55 r15",
      "205/55/15",
      "205/55R15",
      "205/55r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "DOSAGEM.xls / Doses Volkswagen.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/55 R16",
    "aliases": [
      "205 / 55 R16",
      "205 / 55 r16",
      "205/55 R16",
      "205/55 r16",
      "205/55/16",
      "205/55R16",
      "205/55r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 9.0,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 9.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 16), 9.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Astra), 9.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Zafira), 9.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Vectra GT), 9.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Golf 2.0), 9.5 fl oz (DOSAGEM.xls / Doses Renault.pdf - Renault Megane), 9.5 fl oz (Doses Ford.pdf - Ford Focus Titanium), 9.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Bravo (Aro 16)), 9.5 fl oz (Quantidade-Montadoras (Peugeot) - Peugeot 307), 9.5 fl oz (Quantidade-Montadoras (Peugeot) - Peugeot 407), 9.0 fl oz (Quantidade-Montadoras (Toyota) - Toyota Corolla), 9.5 fl oz (Quantidade-Montadoras (Citroen) - Citroen C4 Hatch). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "205/55 R17",
    "aliases": [
      "205 / 55 R17",
      "205 / 55 r17",
      "205/55 R17",
      "205/55 r17",
      "205/55/17",
      "205/55R17",
      "205/55r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "DOSAGEM.xls / Doses Renault.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/60 R15",
    "aliases": [
      "205 / 60 R15",
      "205 / 60 r15",
      "205/60 R15",
      "205/60 r15",
      "205/60/15",
      "205/60R15",
      "205/60r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 8.0,
    "source": "DOSAGEM.xls / Doses Volkswagen.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/60 R16",
    "aliases": [
      "205 / 60 R16",
      "205 / 60 r16",
      "205/60 R16",
      "205/60 r16",
      "205/60/16",
      "205/60R16",
      "205/60r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "DOSAGEM.xls / Doses Kia.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/65 R15",
    "aliases": [
      "205 / 65 R15",
      "205 / 65 r15",
      "205/65 R15",
      "205/65 r15",
      "205/65/15",
      "205/65R15",
      "205/65r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Doses Ford.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/70 R15",
    "aliases": [
      "205 / 70 R15",
      "205 / 70 r15",
      "205/70 R15",
      "205/70 r15",
      "205/70/15",
      "205/70R15",
      "205/70r15"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "205/75 R16",
    "aliases": [
      "205 / 75 R16",
      "205 / 75 r16",
      "205/75 R16",
      "205/75 r16",
      "205/75/16",
      "205/75R16",
      "205/75r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/45 R17",
    "aliases": [
      "215 / 45 R17",
      "215 / 45 r17",
      "215/45 R17",
      "215/45 r17",
      "215/45/17",
      "215/45R17",
      "215/45r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/45 R18",
    "aliases": [
      "215 / 45 R18",
      "215 / 45 r18",
      "215/45 R18",
      "215/45 r18",
      "215/45/18",
      "215/45R18",
      "215/45r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "DOSAGEM.xls / Doses Mitsubishi.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/50 R17",
    "aliases": [
      "215 / 50 R17",
      "215 / 50 r17",
      "215/50 R17",
      "215/50 r17",
      "215/50/17",
      "215/50R17",
      "215/50r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Quantidade-Montadoras (Citroen)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/55 R16",
    "aliases": [
      "215 / 55 R16",
      "215 / 55 r16",
      "215/55 R16",
      "215/55 r16",
      "215/55/16",
      "215/55R16",
      "215/55r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Quantidade-Montadoras (Citroen)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/55 R17",
    "aliases": [
      "215 / 55 R17",
      "215 / 55 r17",
      "215/55 R17",
      "215/55 r17",
      "215/55/17",
      "215/55R17",
      "215/55r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.5,
    "source": "DOSAGEM.xls / Doses Mitsubishi.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/60 R17",
    "aliases": [
      "215 / 60 R17",
      "215 / 60 r17",
      "215/60 R17",
      "215/60 r17",
      "215/60/17",
      "215/60R17",
      "215/60r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.5,
    "source": "DOSAGEM.xls / Doses Mitsubishi.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/65 R16",
    "aliases": [
      "215 / 65 R16",
      "215 / 65 r16",
      "215/65 R16",
      "215/65 r16",
      "215/65/16",
      "215/65R16",
      "215/65r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "215/75 R17,5",
    "aliases": [
      "215 / 75 R17,5",
      "215 / 75 R17.5",
      "215 / 75 r17,5",
      "215 / 75 r17.5",
      "215/75 R17,5",
      "215/75 R17.5",
      "215/75 r17,5",
      "215/75 r17.5",
      "215/75/17,5",
      "215/75/17.5",
      "215/75R17,5",
      "215/75R17.5",
      "215/75r17,5",
      "215/75r17.5"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 17.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "225/45 R17",
    "aliases": [
      "225 / 45 R17",
      "225 / 45 r17",
      "225/45 R17",
      "225/45 r17",
      "225/45/17",
      "225/45R17",
      "225/45r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "225/45 R18",
    "aliases": [
      "225 / 45 R18",
      "225 / 45 r18",
      "225/45 R18",
      "225/45 r18",
      "225/45/18",
      "225/45R18",
      "225/45r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "225/50 R17",
    "aliases": [
      "225 / 50 R17",
      "225 / 50 r17",
      "225/50 R17",
      "225/50 r17",
      "225/50/17",
      "225/50R17",
      "225/50r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "225/55 R18",
    "aliases": [
      "225 / 55 R18",
      "225 / 55 r18",
      "225/55 R18",
      "225/55 r18",
      "225/55/18",
      "225/55R18",
      "225/55r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.5,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 11.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 18), 12.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi Outlander). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "225/65 R17",
    "aliases": [
      "225 / 65 R17",
      "225 / 65 r17",
      "225/65 R17",
      "225/65 r17",
      "225/65/17",
      "225/65R17",
      "225/65r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 10.0,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 11.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 17), 12.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi Pajero TR4), 10.0 fl oz (Quantidade-Montadoras (Toyota) - Toyota RAV4). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "225/70 R16",
    "aliases": [
      "225 / 70 R16",
      "225 / 70 r16",
      "225/70 R16",
      "225/70 r16",
      "225/70/16",
      "225/70R16",
      "225/70r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "DOSAGEM.xls / Doses Kia.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/40 R18",
    "aliases": [
      "235 / 40 R18",
      "235 / 40 r18",
      "235/40 R18",
      "235/40 r18",
      "235/40/18",
      "235/40R18",
      "235/40r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/50 R18",
    "aliases": [
      "235 / 50 R18",
      "235 / 50 r18",
      "235/50 R18",
      "235/50 r18",
      "235/50/18",
      "235/50R18",
      "235/50r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "DOSAGEM.xls / Doses Volkswagen.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/55 R17",
    "aliases": [
      "235 / 55 R17",
      "235 / 55 r17",
      "235/55 R17",
      "235/55 r17",
      "235/55/17",
      "235/55R17",
      "235/55r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/55 R18",
    "aliases": [
      "235 / 55 R18",
      "235 / 55 r18",
      "235/55 R18",
      "235/55 r18",
      "235/55/18",
      "235/55R18",
      "235/55r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "DOSAGEM.xls / Doses Kia.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/60 R16",
    "aliases": [
      "235 / 60 R16",
      "235 / 60 r16",
      "235/60 R16",
      "235/60 r16",
      "235/60/16",
      "235/60R16",
      "235/60r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/60 R17",
    "aliases": [
      "235 / 60 R17",
      "235 / 60 r17",
      "235/60 R17",
      "235/60 r17",
      "235/60/17",
      "235/60R17",
      "235/60r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/60 R18",
    "aliases": [
      "235 / 60 R18",
      "235 / 60 r18",
      "235/60 R18",
      "235/60 r18",
      "235/60/18",
      "235/60R18",
      "235/60r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.5,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "235/70 R16",
    "aliases": [
      "235 / 70 R16",
      "235 / 70 r16",
      "235/70 R16",
      "235/70 r16",
      "235/70/16",
      "235/70R16",
      "235/70r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.5,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "245/40 R18",
    "aliases": [
      "245 / 40 R18",
      "245 / 40 r18",
      "245/40 R18",
      "245/40 r18",
      "245/40/18",
      "245/40R18",
      "245/40r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 11.5,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "245/45 R18",
    "aliases": [
      "245 / 45 R18",
      "245 / 45 r18",
      "245/45 R18",
      "245/45 r18",
      "245/45/18",
      "245/45R18",
      "245/45r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "Quantidade-Montadoras (Citroen)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "245/45 R20",
    "aliases": [
      "245 / 45 R20",
      "245 / 45 r20",
      "245/45 R20",
      "245/45 r20",
      "245/45/20",
      "245/45R20",
      "245/45r20"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 13.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "245/60 R18",
    "aliases": [
      "245 / 60 R18",
      "245 / 60 r18",
      "245/60 R18",
      "245/60 r18",
      "245/60/18",
      "245/60R18",
      "245/60r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 13.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "245/70 R16",
    "aliases": [
      "245 / 70 R16",
      "245 / 70 r16",
      "245/70 R16",
      "245/70 r16",
      "245/70/16",
      "245/70R16",
      "245/70r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 13.0,
    "source": "Doses Ford.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "255/45 R20",
    "aliases": [
      "255 / 45 R20",
      "255 / 45 r20",
      "255/45 R20",
      "255/45 r20",
      "255/45/20",
      "255/45R20",
      "255/45r20"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 13.5,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "255/55 R18",
    "aliases": [
      "255 / 55 R18",
      "255 / 55 r18",
      "255/55 R18",
      "255/55 r18",
      "255/55/18",
      "255/55R18",
      "255/55r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 13.5,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "265/60 R18",
    "aliases": [
      "265 / 60 R18",
      "265 / 60 r18",
      "265/60 R18",
      "265/60 r18",
      "265/60/18",
      "265/60R18",
      "265/60r18"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 15.0,
    "source": "Tabela Resumida Veículos (Leves)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "265/65 R17",
    "aliases": [
      "265 / 65 R17",
      "265 / 65 r17",
      "265/65 R17",
      "265/65 r17",
      "265/65/17",
      "265/65R17",
      "265/65r17"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 15.0,
    "source": "DOSAGEM.xls / Doses Mitsubishi.pdf",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "265/70 R16",
    "aliases": [
      "265 / 70 R16",
      "265 / 70 r16",
      "265/70 R16",
      "265/70 r16",
      "265/70/16",
      "265/70R16",
      "265/70r16"
    ],
    "category": "passeio_leve",
    "fluidOzPerTire": 12.0,
    "source": "Fontes Múltiplas com Divergência",
    "status": "historical_conflict",
    "divergenceNotes": "Divergência histórica entre documentos: 15.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 16), 15.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi L200 Outdoor), 15.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi L200 Triton), 12.0 fl oz (Quantidade-Montadoras (Toyota) - Toyota Hilux). Requer revisão técnica antes de exposição pública como dose oficial."
  },
  {
    "canonicalMeasure": "275/80 R22,5",
    "aliases": [
      "275 / 80 R22,5",
      "275 / 80 R22.5",
      "275 / 80 r22,5",
      "275 / 80 r22.5",
      "275/80 R22,5",
      "275/80 R22.5",
      "275/80 r22,5",
      "275/80 r22.5",
      "275/80/22,5",
      "275/80/22.5",
      "275/80R22,5",
      "275/80R22.5",
      "275/80r22,5",
      "275/80r22.5"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 28,
    "source": "Tabela Resumida Veículos / Decisão Canônica do Projeto",
    "status": "confirmed",
    "divergenceNotes": "Valor unânime de 28 fl oz confirmado pela Tabela Resumida Veículos e pela decisão do projeto."
  },
  {
    "canonicalMeasure": "295/80 R22,5",
    "aliases": [
      "295 / 80 R22,5",
      "295 / 80 R22.5",
      "295 / 80 r22,5",
      "295 / 80 r22.5",
      "295/80 R22,5",
      "295/80 R22.5",
      "295/80 r22,5",
      "295/80 r22.5",
      "295/80/22,5",
      "295/80/22.5",
      "295/80R22,5",
      "295/80R22.5",
      "295/80r22,5",
      "295/80r22.5"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 32.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "305/70 R22,5",
    "aliases": [
      "305 / 70 R22,5",
      "305 / 70 R22.5",
      "305 / 70 r22,5",
      "305 / 70 r22.5",
      "305/70 R22,5",
      "305/70 R22.5",
      "305/70 r22,5",
      "305/70 r22.5",
      "305/70/22,5",
      "305/70/22.5",
      "305/70R22,5",
      "305/70R22.5",
      "305/70r22,5",
      "305/70r22.5"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 32.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  },
  {
    "canonicalMeasure": "8,5 R17,5",
    "aliases": [
      "8,5 R17,5",
      "8,5 r17,5",
      "8,5/17,5",
      "8,5R17,5",
      "8,5r17,5",
      "8.5 R17.5",
      "8.5 r17.5",
      "8.5/17.5",
      "8.5R17.5",
      "8.5r17.5"
    ],
    "category": "caminhao_onibus",
    "fluidOzPerTire": 16.0,
    "source": "Tabela Resumida Veículos (Pesados)",
    "status": "confirmed"
  }
]

/**
 * Normaliza grafias de medidas de pneu (espaçamentos, separadores, ponto/vírgula).
 */
export function normalizeMeasure(raw: string): string {
  if (!raw) return ''
  let s = raw.trim().replace(/\s+/g, ' ')
  // 295/80/22.5 or 295 / 80 R 22.5 or 295/80R22,5
  const m1 = s.match(/^(\d{3})\s*\/\s*(\d{2})[\/\s]*R?\s*(\d{2}(?:[.,]\d+)?)$/i)
  if (m1) {
    const rim = m1[3].replace('.', ',')
    return `${m1[1]}/${m1[2]} R${rim}`
  }
  // 10.00/20 or 10.00 R 20
  const m2 = s.match(/^(\d{2}\.00)[\/\s-]*R?\s*(\d{2})$/i)
  if (m2) {
    return `${m2[1]} R${m2[2]}`
  }
  // 8.5R/17.5 or 8.5 R17.5 or 8.5 R 17.5
  const m3 = s.match(/^(\d+\.?\d*)\s*R\/?\s*(\d{2}(?:[.,]\d+)?)$/i)
  if (m3) {
    const rim = m3[2].replace('.', ',')
    return `${m3[1]} R${rim}`
  }
  return s
}

/**
 * Localiza uma entrada no catálogo por medida ou alias normalizado.
 */
export function findCatalogEntry(measure: string): DosageCatalogEntry | undefined {
  if (!measure) return undefined
  const cleaned = measure.trim().toLowerCase().replace(/\s+/g, ' ')
  const exact = DOSAGE_CATALOG.find(entry => {
    if (entry.canonicalMeasure.toLowerCase() === cleaned) return true
    return entry.aliases.some(alias => alias.toLowerCase() === cleaned)
  })
  if (exact) return exact

  // Tentativa com normalização estruturada
  const norm = normalizeMeasure(measure).toLowerCase()
  if (norm !== cleaned) {
    return DOSAGE_CATALOG.find(entry => {
      if (entry.canonicalMeasure.toLowerCase() === norm) return true
      return entry.aliases.some(alias => alias.toLowerCase() === norm)
    })
  }
  return undefined
}

/**
 * Retorna as medidas ativas com status confirmado para seleção comercial.
 */
export function getConfirmedCatalogEntries(): DosageCatalogEntry[] {
  return DOSAGE_CATALOG.filter(entry => entry.status === 'confirmed')
}
