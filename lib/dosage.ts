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
// ARREDONDAMENTO HALF-UP E REGRAS OPERACIONAIS POR CLASSE DE USO
// ============================================================================

/**
 * Implementa o arredondamento half-up estrito para valores positivos:
 * - parte decimal < 0,5 => arredonda para baixo (Math.floor)
 * - parte decimal >= 0,5 => arredonda para cima (Math.ceil)
 * Exemplos:
 *   9.13 => 9 | 9.49 => 9 | 9.50 => 10 | 9.51 => 10 | 47.24 => 47 | 47.50 => 48
 */
export function roundHalfUp(val: number): number {
  return Math.floor(val + 0.5)
}

export type VehicleUsageClass = 'light_road' | 'heavy_road' | 'slow_machinery'
export type VehicleUsageType = VehicleUsageClass

export const VEHICLE_USAGE_LABELS: Record<VehicleUsageClass, string> = {
  light_road: 'Carro / SUV / van / utilitário leve',
  heavy_road: 'Caminhão / ônibus rodoviário pesado',
  slow_machinery: 'Trator / maquinário / veículo lento',
}

/** Formata número de doses preservando inteiros e uma casa decimal com vírgula para fracionários (ex.: 8,5 ou 32) */
export function formatDoseValue(val: number): string {
  return val % 1 === 0 ? val.toString() : val.toFixed(1).replace('.', ',')
}

/** Formata texto de dose com pluralização natural (ex.: "1 dose", "8,5 doses", "32 doses") */
export function formatDoses(val: number): string {
  const formatted = formatDoseValue(val)
  const unit = val === 1 ? 'dose' : 'doses'
  return `${formatted} ${unit}`
}

/** Mapeia a categoria documental do catálogo para a classe de uso operacional correspondente */
export function mapTireCategoryToUsageClass(category: TireCategory): VehicleUsageClass {
  switch (category) {
    case 'passeio_leve':
      return 'light_road'
    case 'caminhao_onibus':
      return 'heavy_road'
    case 'trator_maquinario':
      return 'slow_machinery'
  }
}

export interface EmpiricalCalculationResult {
  outerDiameterInches: number
  nominalWidthInches: number
  geometricProduct: number
  rawCalculatedDose: number
  rawOunces: number
  appliedDose: number
  divisor: number
  usageClass: VehicleUsageClass
  method: string
}

export interface HeavyRoadEmpiricalParams {
  /** Largura nominal do pneu em milímetros (ex.: 295 para 295/80 R22.5) */
  nominalWidthMm: number
  /** Perfil/série em percentual (ex.: 80 para 295/80 R22.5) */
  aspectRatio: number
  /** Diâmetro nominal do aro em polegadas (ex.: 22.5 para 295/80 R22.5) */
  rimInches: number
}

export interface HeavyRoadEmpiricalResult {
  outerDiameterInches: number
  nominalWidthInches: number
  rawOunces: number
  divisor: 15
  method: 'empirical_heavy_road'
}

/**
 * Cálculo operacional para veículos leves rodoviários (Carro / SUV / van / utilitário leve):
 * Regra: (diâmetro externo nominal em pol × largura nominal em pol) ÷ 22
 */
export function calculateLightRoadDoseEmpirical(params: HeavyRoadEmpiricalParams): EmpiricalCalculationResult {
  const sidewallMm = (params.nominalWidthMm * params.aspectRatio) / 100.0
  const outerDiameterInches = params.rimInches + (2.0 * sidewallMm) / 25.4
  const nominalWidthInches = params.nominalWidthMm / 25.4
  const geometricProduct = outerDiameterInches * nominalWidthInches
  const rawCalculatedDose = geometricProduct / 22.0
  return {
    outerDiameterInches,
    nominalWidthInches,
    geometricProduct,
    rawCalculatedDose,
    rawOunces: rawCalculatedDose,
    appliedDose: roundHalfUp(rawCalculatedDose),
    divisor: 22,
    usageClass: 'light_road',
    method: 'empirical_light_road',
  }
}

/**
 * Cálculo operacional para veículos pesados rodoviários (Caminhão / ônibus rodoviário pesado):
 * Regra: (diâmetro externo nominal em pol × largura nominal em pol) ÷ 15
 */
export function calculateHeavyRoadDoseEmpirical(
  params: HeavyRoadEmpiricalParams
): EmpiricalCalculationResult & HeavyRoadEmpiricalResult {
  const sidewallMm = (params.nominalWidthMm * params.aspectRatio) / 100.0
  const outerDiameterInches = params.rimInches + (2.0 * sidewallMm) / 25.4
  const nominalWidthInches = params.nominalWidthMm / 25.4
  const geometricProduct = outerDiameterInches * nominalWidthInches
  const rawCalculatedDose = geometricProduct / 15.0
  return {
    outerDiameterInches,
    nominalWidthInches,
    geometricProduct,
    rawCalculatedDose,
    rawOunces: rawCalculatedDose,
    appliedDose: roundHalfUp(rawCalculatedDose),
    divisor: 15,
    usageClass: 'heavy_road',
    method: 'empirical_heavy_road',
  }
}

/**
 * Cálculo operacional para maquinário e tratores (Trator / maquinário / veículo lento):
 * Regra: (diâmetro externo nominal em pol × largura nominal em pol) ÷ 10
 */
export function calculateSlowMachineryDoseEmpirical(params: HeavyRoadEmpiricalParams): EmpiricalCalculationResult {
  const sidewallMm = (params.nominalWidthMm * params.aspectRatio) / 100.0
  const outerDiameterInches = params.rimInches + (2.0 * sidewallMm) / 25.4
  const nominalWidthInches = params.nominalWidthMm / 25.4
  const geometricProduct = outerDiameterInches * nominalWidthInches
  const rawCalculatedDose = geometricProduct / 10.0
  return {
    outerDiameterInches,
    nominalWidthInches,
    geometricProduct,
    rawCalculatedDose,
    rawOunces: rawCalculatedDose,
    appliedDose: roundHalfUp(rawCalculatedDose),
    divisor: 10,
    usageClass: 'slow_machinery',
    method: 'empirical_slow_machinery',
  }
}

// ============================================================================
// RESOLVER UNIVERSAL DE DOSAGEM POR CLASSE DE USO
// ============================================================================

export interface ParsedMetricMeasure {
  nominalWidthMm: number
  aspectRatio: number
  rimInches: number
}

/**
 * Analisa e extrai os parâmetros dimensionais nominais de medidas no formato métrico padrão (LARGURA/PERFIL R ARO).
 * Exemplos:
 *   '385/80 R22,5' -> { nominalWidthMm: 385, aspectRatio: 80, rimInches: 22.5 }
 *   '295/80 R22.5' -> { nominalWidthMm: 295, aspectRatio: 80, rimInches: 22.5 }
 *   '10.00 R20'    -> null (formato imperial/sem perfil explícito)
 */
export function parseMetricMeasure(measure: string): ParsedMetricMeasure | null {
  if (!measure) return null
  const norm = normalizeMeasure(measure)
  const match = norm.match(/^(\d{3})\/(\d{2})\s*R\s*(\d{2}(?:[.,]\d+)?)$/i)
  if (!match) return null
  const nominalWidthMm = Number(match[1])
  const aspectRatio = Number(match[2])
  const rimInches = Number(match[3].replace(',', '.'))
  if (isNaN(nominalWidthMm) || isNaN(aspectRatio) || isNaN(rimInches)) return null
  return { nominalWidthMm, aspectRatio, rimInches }
}

export type DosageResolutionStatus = 'resolved' | 'requires_review'
export type DosageResolutionSource = 'table' | 'estimated'

export interface ResolvedDosage {
  status: 'resolved'
  source: DosageResolutionSource
  usageClass?: VehicleUsageClass
  /** Dose técnica bruta antes de arredondamentos (presente quando calculada) */
  rawCalculatedDose?: number
  /** Dose aplicada por pneu: valor exato de tabela para referências, ou arredondada (half-up) para estimativas */
  appliedDose: number
  /** Rótulo público padronizado */
  label: 'Dose de referência' | 'Dose estimada'
  /** Medida canônica resolvida */
  canonicalMeasure: string
  /** Entrada original do catálogo quando procedente de tabela */
  catalogEntry?: DosageCatalogEntry
  /** Compatibilidade técnica: dose por pneu em fl oz / doses */
  fluidOzPerTire: number
}

export interface ReviewRequiredDosage {
  status: 'requires_review'
  reason: 'unknown_measure' | 'needs_usage_class' | 'insufficient_geometry'
  /** Rótulo público padronizado */
  label: 'Consultar dosagem'
  canonicalMeasure?: string
  catalogEntry?: DosageCatalogEntry
  isMetric?: boolean
  parsedMetric?: ParsedMetricMeasure
  allowedUsages?: VehicleUsageClass[]
}

export type DosageResolution = ResolvedDosage | ReviewRequiredDosage

/**
 * Resolve a dosagem técnica aplicável a uma medida de pneu:
 *
 * 1. Medida com dose confirmed no catálogo:
 *    -> SEMPRE utiliza a dose de referência da tabela. Não recalcula. Rótulo: "Dose de referência".
 * 2. Medida com histórico de conflito documental (historical_conflict):
 *    -> Mantém o status histórico no catálogo (sem escolher dose antiga).
 *    -> Se possuir classe documental confiável (ex.: passeio_leve para 205/55 R16),
 *       calcula automaticamente na classe documental. Rótulo: "Dose estimada".
 * 3. Medida fora do catálogo com geometria métrica completa:
 *    -> Se a classe de uso foi fornecida (ou selecionada pelo usuário), calcula a dose estimada.
 *    -> Se não fornecida, solicita a seleção entre as classes operacionais.
 * 4. Medida sem geometria métrica e sem referência de tabela:
 *    -> Retorna "Consultar dosagem".
 */
export function resolveDosageForApplication(
  measure: string,
  usageClass?: VehicleUsageClass | string
): DosageResolution {
  if (!measure || !measure.trim()) {
    return {
      status: 'requires_review',
      reason: 'unknown_measure',
      label: 'Consultar dosagem',
      isMetric: false,
    }
  }

  // 1. Verificar catálogo oficial (medida informada ou normalizada)
  const entry = findCatalogEntry(measure) || findCatalogEntry(normalizeMeasure(measure))
  if (entry) {
    if (entry.status === 'confirmed') {
      return {
        status: 'resolved',
        source: 'table',
        appliedDose: entry.fluidOzPerTire,
        fluidOzPerTire: entry.fluidOzPerTire,
        label: 'Dose de referência',
        canonicalMeasure: entry.canonicalMeasure,
        catalogEntry: entry,
        usageClass: mapTireCategoryToUsageClass(entry.category),
      }
    }

    if (entry.status === 'historical_conflict') {
      const parsed = parseMetricMeasure(entry.canonicalMeasure)
      if (parsed) {
        // Classificação documental automática confiável da medida
        const autoUsage = mapTireCategoryToUsageClass(entry.category)
        const calc =
          autoUsage === 'light_road'
            ? calculateLightRoadDoseEmpirical(parsed)
            : autoUsage === 'heavy_road'
            ? calculateHeavyRoadDoseEmpirical(parsed)
            : calculateSlowMachineryDoseEmpirical(parsed)

        return {
          status: 'resolved',
          source: 'estimated',
          usageClass: autoUsage,
          rawCalculatedDose: calc.rawCalculatedDose,
          appliedDose: calc.appliedDose,
          fluidOzPerTire: calc.appliedDose,
          label: 'Dose estimada',
          canonicalMeasure: entry.canonicalMeasure,
          catalogEntry: entry,
        }
      }

      return {
        status: 'requires_review',
        reason: 'insufficient_geometry',
        label: 'Consultar dosagem',
        canonicalMeasure: entry.canonicalMeasure,
        catalogEntry: entry,
        isMetric: false,
      }
    }
  }

  // 2. Medida fora do catálogo: verificar se é formato métrico completo
  const normalized = normalizeMeasure(measure)
  const parsed = parseMetricMeasure(measure)

  if (parsed) {
    if (
      usageClass === 'light_road' ||
      usageClass === 'heavy_road' ||
      usageClass === 'slow_machinery'
    ) {
      const calc =
        usageClass === 'light_road'
          ? calculateLightRoadDoseEmpirical(parsed)
          : usageClass === 'heavy_road'
          ? calculateHeavyRoadDoseEmpirical(parsed)
          : calculateSlowMachineryDoseEmpirical(parsed)

      return {
        status: 'resolved',
        source: 'estimated',
        usageClass,
        rawCalculatedDose: calc.rawCalculatedDose,
        appliedDose: calc.appliedDose,
        fluidOzPerTire: calc.appliedDose,
        label: 'Dose estimada',
        canonicalMeasure: normalized,
      }
    }

    return {
      status: 'requires_review',
      reason: 'needs_usage_class',
      label: 'Consultar dosagem',
      canonicalMeasure: normalized,
      isMetric: true,
      parsedMetric: parsed,
      allowedUsages: ['light_road', 'heavy_road', 'slow_machinery'],
    }
  }

  // 3. Medida sem geometria suficiente e sem referência
  return {
    status: 'requires_review',
    reason: 'unknown_measure',
    label: 'Consultar dosagem',
    canonicalMeasure: normalized,
    isMetric: false,
  }
}
