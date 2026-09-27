import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DOSAGE_CATALOG, type TireCategory } from '../lib/dosage-catalog'

// Audit only: nominal section width is a proxy, not measured tread width.
// Never imported by the public engine. No fitted factor or wear adjustment.
export function deriveMetricDimensions(measure: string) {
  const match = /^(\d{3})\/(\d{2}) R(\d{2}(?:[.,]\d+)?)$/.exec(measure)
  if (!match) return null // No assumed aspect ratio for imperial/flotation sizes.
  const widthMm = Number(match[1])
  const aspectRatio = Number(match[2])
  const rimInches = Number(match[3].replace(',', '.'))
  const sidewallMm = widthMm * aspectRatio / 100
  const diameterInches = rimInches + 2 * sidewallMm / 25.4
  const nominalWidthInches = widthMm / 25.4
  return { widthMm, aspectRatio, rimInches, sidewallMm, diameterInches, nominalWidthInches,
    calculatedOz: diameterInches * nominalWidthInches / 22 }
}

// Independent numeric fixtures guard unit conversion and unsupported formats.
const fixture = deriveMetricDimensions('225/60 R14')!
assert.equal(fixture.sidewallMm, 135)
assert.ok(Math.abs(fixture.diameterInches * 25.4 - 625.6) < 1e-9)
assert.ok(Math.abs(deriveMetricDimensions('295/80 R22,5')!.calculatedOz - 21.688242240120844) < 1e-6)
assert.equal(deriveMetricDimensions('17,5 R25'), null)
assert.equal(deriveMetricDimensions('12,5L R15'), null)

const rows = DOSAGE_CATALOG.flatMap(entry => {
  const dimensions = deriveMetricDimensions(entry.canonicalMeasure)
  if (entry.status !== 'confirmed' || !dimensions) return []
  const deltaOz = dimensions.calculatedOz - entry.fluidOzPerTire
  return [{ ...entry, ...dimensions, deltaOz, deltaPercent: 100 * deltaOz / entry.fluidOzPerTire }]
})
const categories: TireCategory[] = ['passeio_leve', 'caminhao_onibus', 'trator_maquinario']
const f = (n: number) => n.toFixed(4)
const lines = [
  '# Comparação exploratória ASI /22 × catálogo', '',
  'Gerado por `scripts/analyze_dosage_formula.ts`. Apenas medidas métricas com status `confirmed` entram nas estatísticas.', '',
  'Hipótese: largura nominal de seção aproxima a largura da banda. Isso não comprova equivalência física nem valida uma dose.',
  'Flanco (mm) = largura × perfil / 100; diâmetro (pol) = aro + 2 × flanco / 25,4; dose (fl oz) = diâmetro × (largura / 25,4) / 22.',
  'Diferença = calculado − tabelado; percentual usa a dose tabelada como denominador. Estatísticas usam valores sem arredondamento; somente a exibição é arredondada.',
  'Sem fator corretivo, arredondamento comercial, acréscimo por desgaste ou fallback público. /22 é uma hipótese uniforme de comparação, não uma atribuição de regime operacional às categorias.', '',
  '| Categoria | N | Erro absoluto médio (fl oz) | Erro percentual absoluto médio | Dentro de ±5% | Dentro de ±10% | Dentro de ±0,5 fl oz |',
  '|---|---:|---:|---:|---:|---:|---:|',
]
for (const category of categories) {
  const group = rows.filter(row => row.category === category)
  const n = group.length
  const mae = n ? f(group.reduce((sum, row) => sum + Math.abs(row.deltaOz), 0) / n) : 'N/A'
  const mape = n ? f(group.reduce((sum, row) => sum + Math.abs(row.deltaPercent), 0) / n) + '%' : 'N/A'
  lines.push(`| ${category} | ${n} | ${mae} | ${mape} | ${group.filter(r => Math.abs(r.deltaPercent) <= 5).length} | ${group.filter(r => Math.abs(r.deltaPercent) <= 10).length} | ${group.filter(r => Math.abs(r.deltaOz) <= .5).length} |`)
}
lines.push('', '## Comparação por medida', '',
  '| Medida | Categoria | Flanco mm | Diâmetro pol | Largura nominal pol | Tabela fl oz | /22 fl oz | Diferença fl oz | Diferença % |',
  '|---|---|---:|---:|---:|---:|---:|---:|---:|')
for (const r of rows) lines.push(`| ${r.canonicalMeasure} | ${r.category} | ${f(r.sidewallMm)} | ${f(r.diameterInches)} | ${f(r.nominalWidthInches)} | ${r.fluidOzPerTire} | ${f(r.calculatedOz)} | ${f(r.deltaOz)} | ${f(r.deltaPercent)} |`)
lines.push('', '## Exclusões explícitas', '', '| Medida | Categoria | Motivo |', '|---|---|---|')
for (const entry of DOSAGE_CATALOG) {
  if (entry.status !== 'confirmed' || !deriveMetricDimensions(entry.canonicalMeasure)) {
    lines.push(`| ${entry.canonicalMeasure} | ${entry.category} | ${entry.status !== 'confirmed' ? entry.status + ': sem dose única validada no acervo' : 'Formato sem perfil métrico explícito; dimensões não inferidas'} |`)
  }
}
lines.push('', 'A aproximação em leves e a divergência em pesados não demonstram como a tabela foi construída. Não há amostra métrica elegível de maquinário para avaliar /22 nessa categoria.', '')
writeFileSync(resolve('docs/dosage-formula-analysis.md'), lines.join('\n'))
console.log(`Analysis: ${rows.length} compared, ${DOSAGE_CATALOG.length - rows.length} excluded`)
