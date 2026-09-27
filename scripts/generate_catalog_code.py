import os, json, re
from pathlib import Path
from extract_all_sources import all_observations, norm_measure

# Category mapping
def map_category(cat_str, norm):
    # Categorias documentais reconhecidas sempre precedem heurísticas da medida.
    if 'Trator' in cat_str or 'Maquin' in cat_str:
        return 'trator_maquinario'
    if 'Caminh' in cat_str or 'Ônibus' in cat_str:
        return 'caminhao_onibus'
    if 'Passeio' in cat_str or 'Leve' in cat_str or 'Utilitário' in cat_str:
        return 'passeio_leve'
    if re.search(r'R(?:22\.5|17\.5)$', norm) or norm in ('10.00 R20', '11.00 R20'):
        return 'caminhao_onibus'
    return 'passeio_leve'

def generate_aliases(norm):
    # e.g., '295/80 R22.5' or '175/70 R14' or '10.00 R20'
    aliases = set()
    aliases.add(norm)
    # with comma: 295/80 R22,5
    norm_comma = norm.replace('.', ',')
    aliases.add(norm_comma)
    # without space: 295/80R22.5 and 295/80R22,5
    aliases.add(norm.replace(' R', 'R'))
    aliases.add(norm_comma.replace(' R', 'R'))
    # with slash instead of R: 295/80/22.5, 295/80/22,5
    aliases.add(norm.replace(' R', '/'))
    aliases.add(norm_comma.replace(' R', '/'))
    # spaces around slash
    aliases.add(norm.replace('/', ' / '))
    aliases.add(norm_comma.replace('/', ' / '))
    # lower case
    aliases_lower = set(a.lower() for a in aliases)
    return sorted(list(aliases | aliases_lower))

entries = []
for norm in sorted(all_observations.keys()):
    obs = all_observations[norm]
    doses = sorted(list(set(o['dose'] for o in obs)))
    cat = map_category(obs[0]['category'], norm)
    
    # Check canonical rules
    if norm == '275/80 R22.5':
        entry = {
            'canonicalMeasure': '275/80 R22,5',
            'aliases': generate_aliases('275/80 R22.5'),
            'category': 'caminhao_onibus',
            'fluidOzPerTire': 28,
            'source': 'Tabela Resumida Veículos / Decisão Canônica do Projeto',
            'status': 'confirmed',
            'divergenceNotes': 'Valor unânime de 28 fl oz confirmado pela Tabela Resumida Veículos e pela decisão do projeto.'
        }
    elif len(doses) == 1:
        canonical_m = norm.replace('.', ',') if '.5' in norm else norm
        entry = {
            'canonicalMeasure': canonical_m,
            'aliases': generate_aliases(norm),
            'category': cat,
            'fluidOzPerTire': doses[0],
            'source': obs[0]['source'],
            'status': 'confirmed',
        }
    else:
        # Divergent doses between documents
        canonical_m = norm.replace('.', ',') if '.5' in norm else norm
        # Build note
        details = [f"{o['dose']} fl oz ({o['source']} - {o['detail']})" for o in obs]
        entry = {
            'canonicalMeasure': canonical_m,
            'aliases': generate_aliases(norm),
            'category': cat,
            'fluidOzPerTire': doses[0], # primary reference, but flagged
            'source': 'Fontes Múltiplas com Divergência',
            'status': 'historical_conflict',
            'divergenceNotes': f"Divergência histórica entre documentos: {', '.join(details)}. Requer revisão técnica antes de exposição pública como dose oficial."
        }
    entries.append(entry)

print(f'Total entries generated: {len(entries)}')
confirmed = [e for e in entries if e['status'] == 'confirmed']
conflicts = [e for e in entries if e['status'] == 'historical_conflict']
needs_rev = [e for e in entries if e['status'] == 'needs_review']
print(f'Confirmed: {len(confirmed)}')
print(f'Historical Conflict: {len(conflicts)}')
print(f'Needs Review: {len(needs_rev)}')

# Output TS code
with (Path(__file__).resolve().parents[1] / 'lib/dosage-catalog.ts').open('w', encoding='utf-8') as f:
    f.write('''// ============================================================================
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

export const DOSAGE_CATALOG: DosageCatalogEntry[] = ''')
    f.write(json.dumps(entries, indent=2, ensure_ascii=False))
    f.write('''\n
/**
 * Normaliza grafias de medidas de pneu (espaçamentos, separadores, ponto/vírgula).
 */
export function normalizeMeasure(raw: string): string {
  if (!raw) return ''
  let s = raw.trim().replace(/\\s+/g, ' ')
  // 295/80/22.5 or 295 / 80 R 22.5 or 295/80R22,5
  const m1 = s.match(/^(\\d{3})\\s*\\/\\s*(\\d{2})[\\/\\s]*R?\\s*(\\d{2}(?:[.,]\\d+)?)$/i)
  if (m1) {
    const rim = m1[3].replace('.', ',')
    return `${m1[1]}/${m1[2]} R${rim}`
  }
  // 10.00/20 or 10.00 R 20
  const m2 = s.match(/^(\\d{2}\\.00)[\\/\\s-]*R?\\s*(\\d{2})$/i)
  if (m2) {
    return `${m2[1]} R${m2[2]}`
  }
  // 8.5R/17.5 or 8.5 R17.5 or 8.5 R 17.5
  const m3 = s.match(/^(\\d+\\.?\\d*)\\s*R\\/?\\s*(\\d{2}(?:[.,]\\d+)?)$/i)
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
  const cleaned = measure.trim().toLowerCase().replace(/\\s+/g, ' ')
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
''')
