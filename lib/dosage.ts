// ============================================================================
// FLAT FREE BRASIL — MOTOR TÉCNICO DE DOSAGEM
//
// Unidade canônica: Onças fluidas americanas (US fl oz) por pneu.
// Conversões:
//   1 galão US = 128 fl oz
//   1 balde comercial (5 gal US) = 640 fl oz ≈ 18,9 litros
//   1 litro ≈ 33,814 fl oz
//
// Regras canônicas vigentes do projeto:
//   275/80 R22,5 = 28 US fl oz por pneu
//   295/80 R22,5 = 32 US fl oz por pneu
// ============================================================================

import {
  DOSAGE_CATALOG,
  findCatalogEntry,
  getConfirmedCatalogEntries,
  type DosageCatalogEntry,
  type TechnicalStatus,
  type TireCategory,
} from './dosage-catalog'

export {
  DOSAGE_CATALOG,
  findCatalogEntry,
  getConfirmedCatalogEntries,
  type DosageCatalogEntry,
  type TechnicalStatus,
  type TireCategory,
}

export interface DosageEntry {
  measure: string
  fluidOzPerTire: number
}

/**
 * Tabela canônica básica para seleção comercial pública imediata.
 * Preserva os valores essenciais definidos pelo projeto para pesados.
 */
export const DOSAGE_TABLE: DosageEntry[] = [
  { measure: '275/80 R22,5', fluidOzPerTire: 28 },
  { measure: '295/80 R22,5', fluidOzPerTire: 32 },
]

/** Onças fluidas americanas por galão US */
export const OZ_PER_GALLON = 128

/** Onças fluidas americanas por balde de 5 galões US */
export const OZ_PER_BUCKET = 640

/** Litros aproximados por balde de 5 galões US */
export const LITERS_PER_BUCKET = 18.9

/** Alias para compatibilidade legada */
export const BUCKET_LITERS = 18.9

/** Onças fluidas americanas aproximadas por litro */
export const OZ_PER_LITER = 33.814

/**
 * Normaliza grafias de medidas de pneu (espaçamentos, separadores, ponto/vírgula).
 * Exemplos:
 *   '295/80R22.5'  -> '295/80 R22,5'
 *   '295/80/22,5'  -> '295/80 R22,5'
 *   '295 / 80 R 22.5' -> '295/80 R22,5'
 *   '10.00/20'     -> '10.00 R20'
 *   '8.5R/17.5'    -> '8.5 R17,5'
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
 * Retorna a dosagem canônica oficial em US fl oz para uma medida informada.
 *
 * Regras:
 * 1. 275/80 R22,5 resolve para 28 fl oz (em qualquer alias suportado).
 * 2. 295/80 R22,5 resolve para 32 fl oz (em qualquer alias suportado).
 * 3. Medidas sem divergência no acervo consultado retornam a dose catalogada.
 * 4. Medidas com histórico de conflito documental (historical_conflict) ou pendentes de
 *    revisão (needs_review) retornam null para exigir análise técnica e NÃO serem
 *    silenciosamente expostas com dose arbitrária.
 * 5. Medidas desconhecidas retornam null ("Consultar dosagem").
 */
export function getDosageOz(measure: string): number | null {
  if (!measure) return null

  // 1. Busca direta no catálogo por alias / medida normalizada
  const entry = findCatalogEntry(measure)
  if (entry) {
    // Medidas com conflito ou pendentes não geram dose automática pública
    if (entry.status === 'confirmed') {
      return entry.fluidOzPerTire
    }
    return null
  }

  // 2. Fallback de normalização adicional
  const norm = normalizeMeasure(measure)
  if (norm !== measure) {
    const entryNorm = findCatalogEntry(norm)
    if (entryNorm && entryNorm.status === 'confirmed') {
      return entryNorm.fluidOzPerTire
    }
  }

  return null
}

/** Converte onças fluidas (fl oz) para litros */
export function ozToLiters(oz: number): number {
  return oz / OZ_PER_LITER
}

/** Quantidade técnica exata de baldes de 5 galões necessária (pode ser fracionária) */
export function ozToBucketsFractional(oz: number): number {
  return oz / OZ_PER_BUCKET
}

/** Quantidade inteira de baldes de 5 galões para pedido comercial (arredondada para cima) */
export function ozToBucketsCeil(oz: number): number {
  return Math.ceil(oz / OZ_PER_BUCKET)
}

// ============================================================================
// ESTRUTURA PARA CÁLCULO MANUAL PELA FÓRMULA DO FABRICANTE (ASI CHEMICAL INC.)
// ============================================================================

export interface FormulaCalculationParams {
  /** Altura total física do pneu montado em polegadas (Height of Tire) */
  tireHeightInches: number
  /** Largura real da banda de rodagem em polegadas (Width of Tread) — NÃO confundir com largura nominal de seção */
  treadWidthInches: number
  /** Regime de velocidade operacional do veículo */
  speedRegime: 'over_45_mph' | 'under_45_mph'
  /** Adicionar 10% para pneus antigos e extremamente desgastados (regra documental Tire Chart.pdf) */
  isOldOrExtremelyWorn?: boolean
}

export interface FormulaCalculationResult {
  /** Quantidade exata calculada antes de arredondamentos */
  rawOunces: number
  /** Quantidade recomendada com eventual ajuste de pneu desgastado */
  recommendedOunces: number
  /** Regime de velocidade considerado */
  speedRegime: 'over_45_mph' | 'under_45_mph'
  /** Divisor aplicado (22 para >45 MPH, 10 para <45 MPH) */
  divisor: 22 | 10
  /** Indica se o acréscimo de 10% de desgaste foi aplicado */
  oldTireAdjustmentApplied: boolean
}

/**
 * Executa o cálculo isolado da dosagem baseado na fórmula original da ASI Chemical Inc. ("Tire Chart.pdf").
 *
 * Fórmulas originais:
 * - Veículos acima de 45 MPH (carros, caminhões, vans, utilitários leves):
 *     (Altura do pneu em pol × Largura da banda de rodagem em pol) / 22
 * - Veículos abaixo de 45 MPH (equipamentos, tratores, ATVs, veículos lentos):
 *     (Altura do pneu em pol × Largura da banda de rodagem em pol) / 10
 * - Observação: acrescentar 10% a mais para pneus antigos e extremamente desgastados.
 *
 * LIMITAÇÃO DOCUMENTAL CRÍTICA:
 * A fórmula requer a medição física em polegadas da LARGURA REAL DA BANDA DE RODAGEM (área de contato),
 * e NÃO a largura de seção nominal do código do pneu (ex.: os 295 mm de 295/80 R22.5).
 * Aplicar a fórmula /22 com largura nominal de seção resulta em valores incoerentes para caminhões pesados
 * (~21,7 fl oz vs os 32 fl oz canônicos).
 * Por essa razão, esta função é mantida estritamente ISOLADA para fins de teste e auditoria técnica,
 * NÃO atuando como fallback automático para a interface pública do projeto.
 */
export function calculateDoseFromFormula(params: FormulaCalculationParams): FormulaCalculationResult {
  const divisor = params.speedRegime === 'under_45_mph' ? 10 : 22
  const raw = (params.tireHeightInches * params.treadWidthInches) / divisor
  const recommended = params.isOldOrExtremelyWorn ? raw * 1.10 : raw
  return {
    rawOunces: raw,
    recommendedOunces: recommended,
    speedRegime: params.speedRegime,
    divisor,
    oldTireAdjustmentApplied: !!params.isOldOrExtremelyWorn,
  }
}

// ============================================================================
// REGRA EMPÍRICA DERIVADA PARA PESADOS RODOVIÁRIOS (DIVISOR 15)
// ============================================================================

export interface HeavyRoadEmpiricalParams {
  /** Largura nominal do pneu em milímetros (ex.: 295 para 295/80 R22.5) */
  nominalWidthMm: number
  /** Perfil/série em percentual (ex.: 80 para 295/80 R22.5) */
  aspectRatio: number
  /** Diâmetro nominal do aro em polegadas (ex.: 22.5 para 295/80 R22.5) */
  rimInches: number
}

export interface HeavyRoadEmpiricalResult {
  /** Diâmetro externo nominal calculado em polegadas */
  outerDiameterInches: number
  /** Largura nominal calculada em polegadas */
  nominalWidthInches: number
  /** Dose bruta estimada em US fl oz */
  rawOunces: number
  /** Divisor estatístico empírico aplicado (15) */
  divisor: 15
  /** Identificação do método */
  method: 'empirical_heavy_road'
}

/**
 * Cálculo empírico derivado das dosagens históricas de veículos pesados rodoviários (caminhões e ônibus).
 *
 * Fórmula empírica:
 *   dose estimada ≈ (diâmetro externo nominal em pol × largura nominal em pol) ÷ 15
 *
 * Base matemática:
 *   Regra empírica provisória com alta aderência aos quatro pontos históricos pesados métricos
 *   atualmente disponíveis: 215/75 R17,5 (17 oz), 275/80 R22,5 (28 oz), 295/80 R22,5 (32 oz)
 *   e 305/70 R22,5 (32 oz). Divisor ótimo conjunto por mínimos quadrados ~14.9966 (MAPE ~1,29%).
 *   Novas evidências ou dados operacionais futuros podem recalibrar o divisor.
 *
 * IMPORTANTE:
 * 1. Esta regra /15 NÃO substitui a fórmula documental ASI /22.
 * 2. O uso exploratório de fórmulas com largura nominal de seção não invalida a fórmula ASI /22,
 *    que exige a medição real da largura da banda de rodagem (Width of Tread).
 * 3. Permanece estritamente isolada e NÃO está conectada ao getDosageOz nem à UI pública.
 * 4. Se uma medida possui dose tabelada no catálogo, a tabela deve prevalecer sempre.
 */
export function calculateHeavyRoadDoseEmpirical(params: HeavyRoadEmpiricalParams): HeavyRoadEmpiricalResult {
  const sidewallMm = (params.nominalWidthMm * params.aspectRatio) / 100.0
  const outerDiameterInches = params.rimInches + (2.0 * sidewallMm) / 25.4
  const nominalWidthInches = params.nominalWidthMm / 25.4
  const rawOunces = (outerDiameterInches * nominalWidthInches) / 15.0

  return {
    outerDiameterInches,
    nominalWidthInches,
    rawOunces,
    divisor: 15,
    method: 'empirical_heavy_road',
  }
}

