// ============================================================================
// FLAT FREE BRASIL — ANÁLISE COMPARATIVA DE FÓRMULAS E REGRA EMPÍRICA /15
// Executa a modelagem matemática sobre os 4 pneus pesados métricos documentados
// e a comparação exploratória do catálogo com a fórmula documental ASI /22.
// ============================================================================

import assert from 'node:assert/strict'
import { DOSAGE_CATALOG, type TireCategory } from '../lib/dosage-catalog'

export interface HeavyTireData {
  name: string
  widthMm: number
  aspectRatio: number
  rimInches: number
  tableDoseOz: number
}

export const HEAVY_METRIC_TIRES: HeavyTireData[] = [
  { name: '215/75 R17,5', widthMm: 215, aspectRatio: 75, rimInches: 17.5, tableDoseOz: 17.0 },
  { name: '275/80 R22,5', widthMm: 275, aspectRatio: 80, rimInches: 22.5, tableDoseOz: 28.0 },
  { name: '295/80 R22,5', widthMm: 295, aspectRatio: 80, rimInches: 22.5, tableDoseOz: 32.0 },
  { name: '305/70 R22,5', widthMm: 305, aspectRatio: 70, rimInches: 22.5, tableDoseOz: 32.0 },
]

export interface DivisorStats {
  divisor: number
  mae: number
  mape: number
  tireResults: {
    name: string
    calculatedOz: number
    tableDoseOz: number
    errorOz: number
    percentError: number
  }[]
}

// Audit only: nominal section width is a proxy, not measured tread width.
// Never imported by the public engine. No fitted factor or wear adjustment.
export function deriveMetricDimensions(measure: string) {
  const match = /^(\d{3})\/(\d{2}) R(\d{2}(?:[.,]\d+)?)$/.exec(measure)
  if (!match) return null // No assumed aspect ratio for imperial/flotation sizes.
  const widthMm = Number(match[1])
  const aspectRatio = Number(match[2])
  const rimInches = Number(match[3].replace(',', '.'))
  const sidewallMm = (widthMm * aspectRatio) / 100
  const diameterInches = rimInches + (2 * sidewallMm) / 25.4
  const nominalWidthInches = widthMm / 25.4
  return {
    widthMm,
    aspectRatio,
    rimInches,
    sidewallMm,
    diameterInches,
    nominalWidthInches,
    calculatedOz: (diameterInches * nominalWidthInches) / 22,
  }
}

// Independent numeric fixtures guard unit conversion and unsupported formats.
const fixture = deriveMetricDimensions('225/60 R14')!
assert.equal(fixture.sidewallMm, 135)
assert.ok(Math.abs(fixture.diameterInches * 25.4 - 625.6) < 1e-9)
assert.ok(Math.abs(deriveMetricDimensions('295/80 R22,5')!.calculatedOz - 21.688242240120844) < 1e-6)
assert.equal(deriveMetricDimensions('17,5 R25'), null)
assert.equal(deriveMetricDimensions('12,5L R15'), null)

export function runFormulaAnalysis() {
  console.log('================================================================================')
  console.log('FLAT FREE BRASIL — AUDITORIA MATEMÁTICA: DIVISORES PARA PESADOS RODOVIÁRIOS')
  console.log('================================================================================\n')

  const products: number[] = []
  const doses: number[] = []
  const implicitDivisors: number[] = []

  console.log('1. PONTOS HISTÓRICOS DOCUMENTADOS E DIVISORES IMPLÍCITOS:')
  console.log('--------------------------------------------------------------------------------')
  for (const t of HEAVY_METRIC_TIRES) {
    const sidewallMm = (t.widthMm * t.aspectRatio) / 100.0
    const outerDiameterInches = t.rimInches + (2.0 * sidewallMm) / 25.4
    const nominalWidthInches = t.widthMm / 25.4
    const prod = outerDiameterInches * nominalWidthInches
    const div = prod / t.tableDoseOz

    products.push(prod)
    doses.push(t.tableDoseOz)
    implicitDivisors.push(div)

    console.log(
      `${t.name.padEnd(16)} | DiâmExt: ${outerDiameterInches.toFixed(4)}" | LargNom: ${nominalWidthInches.toFixed(4)}" | Prod: ${prod.toFixed(4)} | Dose: ${t.tableDoseOz.toFixed(1)} oz | Divisor Implícito: ~${div.toFixed(2)} (${div.toFixed(4)})`
    )
  }

  // Regressão de Mínimos Quadrados: Dose = Prod / k => minimizar sum((Prod/k - Dose)^2)
  // d/dk [ sum(Prod/k - Dose)^2 ] = sum 2*(Prod/k - Dose) * (-Prod / k^2) = 0
  // => sum(Prod^2 / k) - sum(Prod * Dose) = 0 => k = sum(Prod^2) / sum(Prod * Dose)
  const sumProdSq = products.reduce((acc, p) => acc + p * p, 0)
  const sumProdDose = products.reduce((acc, p, idx) => acc + p * doses[idx], 0)
  const optimalDivisor = sumProdSq / sumProdDose

  console.log('\n2. REGRESSÃO POR MÍNIMOS QUADRADOS:')
  console.log('--------------------------------------------------------------------------------')
  console.log(`Melhor divisor conjunto calculado (ótimos mínimos quadrados): ${optimalDivisor.toFixed(4)}`)
  console.log('Conclusão: Regra empírica provisória com alta aderência aos quatro pontos históricos pesados métricos atualmente disponíveis. Novas evidências podem recalibrar o divisor.\n')

  const testDivisors = [22, 17, 15]
  const statsList: DivisorStats[] = []

  console.log('3. COMPARATIVO DETALHADO POR PNEU:')
  console.log('--------------------------------------------------------------------------------')
  console.log(
    'Medida'.padEnd(16) +
      '| Tabela | ' +
      'Dose /22 | Erro /22 | ' +
      'Dose /17 | Erro /17 | ' +
      'Dose /15 | Erro /15'
  )
  console.log('-'.repeat(80))

  for (let i = 0; i < HEAVY_METRIC_TIRES.length; i++) {
    const t = HEAVY_METRIC_TIRES[i]
    const prod = products[i]
    const dose22 = prod / 22.0
    const err22 = ((dose22 - t.tableDoseOz) / t.tableDoseOz) * 100.0

    const dose17 = prod / 17.0
    const err17 = ((dose17 - t.tableDoseOz) / t.tableDoseOz) * 100.0

    const dose15 = prod / 15.0
    const err15 = ((dose15 - t.tableDoseOz) / t.tableDoseOz) * 100.0

    console.log(
      `${t.name.padEnd(16)}| ${t.tableDoseOz.toFixed(1).padStart(4)} oz | ` +
        `${dose22.toFixed(2).padStart(5)} oz | ${err22.toFixed(1).padStart(7)}% | ` +
        `${dose17.toFixed(2).padStart(5)} oz | ${err17.toFixed(1).padStart(7)}% | ` +
        `${dose15.toFixed(2).padStart(5)} oz | ${err15.toFixed(1).padStart(7)}%`
    )
  }

  for (const div of testDivisors) {
    let sumAbsErr = 0
    let sumAbsPctErr = 0
    const tireResults = []

    for (let i = 0; i < HEAVY_METRIC_TIRES.length; i++) {
      const t = HEAVY_METRIC_TIRES[i]
      const prod = products[i]
      const calcDose = prod / div
      const err = calcDose - t.tableDoseOz
      const pctErr = (err / t.tableDoseOz) * 100.0

      sumAbsErr += Math.abs(err)
      sumAbsPctErr += Math.abs(pctErr)

      tireResults.push({
        name: t.name,
        calculatedOz: calcDose,
        tableDoseOz: t.tableDoseOz,
        errorOz: err,
        percentError: pctErr,
      })
    }

    statsList.push({
      divisor: div,
      mae: sumAbsErr / HEAVY_METRIC_TIRES.length,
      mape: sumAbsPctErr / HEAVY_METRIC_TIRES.length,
      tireResults,
    })
  }

  console.log('\n4. MÉTRICAS AGREGADAS:')
  console.log('--------------------------------------------------------------------------------')
  for (const s of statsList) {
    console.log(
      `Divisor /${s.divisor.toString().padEnd(2)}: MAE = ${s.mae.toFixed(2).padStart(5)} fl oz | MAPE = ${s.mape.toFixed(2).padStart(5)}%`
    )
  }

  // Caso exploratório: 385/80 R22.5
  console.log('\n5. CASO EXPLORATÓRIO: 385/80 R22,5 (NÃO INCLUÍDO NO CATÁLOGO OFICIAL):')
  console.log('--------------------------------------------------------------------------------')
  const sw385 = (385 * 80) / 100.0 // 308 mm
  const od385 = 22.5 + (2 * sw385) / 25.4 // ~ 46.7520"
  const w385 = 385 / 25.4 // ~ 15.1575"
  const prod385 = od385 * w385 // ~ 708.6416
  const dose385_15 = prod385 / 15.0

  console.log(`Dimensões: Flanco = ${sw385} mm | Diâmetro = ${od385.toFixed(4)}" | Largura = ${w385.toFixed(4)}"`)
  console.log(`Dose exploratória calculada (/15): ${dose385_15.toFixed(2)} fl oz (exato: ${dose385_15.toFixed(4)} fl oz)`)
  console.log('Classificação hierárquica: NÍVEL E (Cálculo empírico provisório não validado em tabela documental)')
  console.log('Status no catálogo: AUSENTE (retorna null na interface pública getDosageOz)')

  return { optimalDivisor, statsList, dose385_15 }
}

// Execute analysis
runFormulaAnalysis()
