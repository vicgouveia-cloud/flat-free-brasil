import {
  DOSAGE_CATALOG,
  getDosageOz,
  normalizeMeasure,
  calculateDoseFromFormula,
  calculateHeavyRoadDoseEmpirical,
  findCatalogEntry,
  DOSAGE_TABLE,
  OZ_PER_BUCKET,
  LITERS_PER_BUCKET,
  BUCKET_LITERS,
  ozToLiters,
  ozToBucketsFractional,
  ozToBucketsCeil,
  resolveDosageForApplication,
  parseMetricMeasure,
} from '../lib/dosage'

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg)
    process.exit(1)
  }
  console.log('PASS:', msg)
}

console.log('--- Testing Canonical Dosages ---')
assert(getDosageOz('275/80 R22,5') === 28, '275/80 R22,5 canonical returns 28 fl oz')
assert(getDosageOz('295/80 R22,5') === 32, '295/80 R22,5 canonical returns 32 fl oz')

console.log('--- Testing Aliases ---')
const aliases295 = [
  '295/80 R22.5',
  '295/80R22.5',
  '295/80R22,5',
  '295/80/22.5',
  '295/80/22,5',
  '295 / 80 R 22.5',
  '295 / 80 R 22,5',
]
for (const a of aliases295) {
  assert(getDosageOz(a) === 32, `Alias "${a}" resolves to 32 fl oz`)
}

const aliases275 = [
  '275/80 R22.5',
  '275/80R22.5',
  '275/80R22,5',
  '275/80/22.5',
  '275/80/22,5',
]
for (const a of aliases275) {
  assert(getDosageOz(a) === 28, `Alias "${a}" resolves to 28 fl oz`)
}

console.log('--- Testing Conflict Handling ---')
assert(getDosageOz('205/55 R16') === null, 'Conflicting measure 205/55 R16 returns null for public dose')
const conflictEntry = findCatalogEntry('205/55 R16')
assert(conflictEntry !== undefined, 'Conflicting measure exists in catalog')
assert(conflictEntry?.status === 'historical_conflict', 'Conflicting measure has status historical_conflict')
assert(!!conflictEntry?.divergenceNotes, 'Conflicting measure has divergence notes documented')

console.log('--- Testing Bucket Constants ---')
assert(OZ_PER_BUCKET === 640, 'OZ_PER_BUCKET is 640 fl oz')
assert(LITERS_PER_BUCKET === 18.9, 'LITERS_PER_BUCKET is 18.9 L')
assert(BUCKET_LITERS === 18.9, 'BUCKET_LITERS is 18.9 L')
assert(ozToBucketsCeil(640) === 1, '640 fl oz = 1 bucket ceil')
assert(ozToBucketsCeil(641) === 2, '641 fl oz = 2 buckets ceil')
assert(Math.abs(ozToLiters(640) - 18.927) < 0.05, '640 fl oz ≈ 18.9 L')

console.log('--- Testing Isolated Formula Engine ---')
// ASI formula: (tireHeight * treadWidth) / divisor
// > 45 mph => divisor 22
const resOver = calculateDoseFromFormula({
  tireHeightInches: 25,
  treadWidthInches: 8,
  speedRegime: 'over_45_mph',
})
assert(Math.abs(resOver.rawOunces - (200 / 22)) < 0.001, 'Formula >45mph divisor 22')
assert(resOver.divisor === 22, 'Divisor is 22')

// < 45 mph => divisor 10
const resUnder = calculateDoseFromFormula({
  tireHeightInches: 25,
  treadWidthInches: 8,
  speedRegime: 'under_45_mph',
})
assert(Math.abs(resUnder.rawOunces - (200 / 10)) < 0.001, 'Formula <45mph divisor 10')
assert(resUnder.divisor === 10, 'Divisor is 10')

// Old tire adjustment (+10%)
const resWorn = calculateDoseFromFormula({
  tireHeightInches: 25,
  treadWidthInches: 8,
  speedRegime: 'over_45_mph',
  isOldOrExtremelyWorn: true,
})
assert(Math.abs(resWorn.recommendedOunces - (200 / 22) * 1.10) < 0.001, 'Old tire adjustment adds +10%')

console.log('--- Testing Catalog Invariants ---')
assert(getDosageOz('305/70 R22,5') === 32, '305/70 preserved at 32 fl oz')
assert(findCatalogEntry('17,5 R25')?.category === 'trator_maquinario', '17,5 R25 uses documentary category')
assert(getDosageOz('225/60 R14') === null, 'Unknown metric measure has no formula fallback')
const expectedConflicts = ['165/70 R13', '175/65 R14', '175/70 R14', '195/55 R15', '195/60 R15', '205/55 R16', '225/55 R18', '225/65 R17', '265/70 R16']
assert(JSON.stringify(DOSAGE_CATALOG.filter(e => e.status === 'historical_conflict').map(e => e.canonicalMeasure).sort()) === JSON.stringify(expectedConflicts), 'Exact nine historical conflicts')
for (const measure of expectedConflicts) assert(getDosageOz(measure) === null, `${measure} blocks public dose`)
assert(DOSAGE_CATALOG.length === 63 && DOSAGE_CATALOG.filter(e => e.status === 'confirmed').length === 54, '63 entries, 54 confirmed')
for (const [category, count] of [['passeio_leve', 53], ['caminhao_onibus', 7], ['trator_maquinario', 3]] as const) {
  assert(DOSAGE_CATALOG.filter(e => e.category === category).length === count, `${category}: ${count} entries`)
}
assert(DOSAGE_TABLE.every(e => getDosageOz(e.measure) === e.fluidOzPerTire), 'Public table agrees with catalog')

console.log('--- Testing Empirical Heavy Road Formula (/15) ---')
// 295/80 R22.5 empirical ~ 31.8 fl oz
const emp295 = calculateHeavyRoadDoseEmpirical({
  nominalWidthMm: 295,
  aspectRatio: 80,
  rimInches: 22.5,
})
assert(Math.abs(emp295.rawOunces - 31.81) < 0.05, `295/80 R22.5 empirical is close to 31.8 fl oz (${emp295.rawOunces.toFixed(2)} oz)`)
assert(emp295.divisor === 15, 'Empirical divisor is 15')
assert(emp295.method === 'empirical_heavy_road', 'Method is empirical_heavy_road')

// 305/70 R22.5 empirical ~ 31.5 fl oz
const emp305 = calculateHeavyRoadDoseEmpirical({
  nominalWidthMm: 305,
  aspectRatio: 70,
  rimInches: 22.5,
})
assert(Math.abs(emp305.rawOunces - 31.47) < 0.05, `305/70 R22.5 empirical is close to 31.5 fl oz (${emp305.rawOunces.toFixed(2)} oz)`)

// 385/80 R22.5 exploratory case ~ 47.24 fl oz
const emp385 = calculateHeavyRoadDoseEmpirical({
  nominalWidthMm: 385,
  aspectRatio: 80,
  rimInches: 22.5,
})
assert(Math.abs(emp385.rawOunces - 47.24) < 0.05, `385/80 R22.5 exploratory dose is close to 47.24 fl oz (${emp385.rawOunces.toFixed(2)} oz)`)

// 385/80 R22.5 must NOT be in official catalog and must return null in public getDosageOz
assert(getDosageOz('385/80 R22,5') === null, '385/80 R22,5 returns null in getDosageOz')
assert(getDosageOz('385/80 R22.5') === null, '385/80 R22.5 returns null in getDosageOz')
assert(findCatalogEntry('385/80 R22,5') === undefined, '385/80 R22,5 is not present in official catalog')

// Confirm table doses continue prevailing
assert(getDosageOz('275/80 R22,5') === 28, 'Confirmed table dose 275/80 R22,5 prevails (28 oz)')
assert(getDosageOz('295/80 R22,5') === 32, 'Confirmed table dose 295/80 R22,5 prevails (32 oz)')

// Confirm historical conflict continues returning null
assert(getDosageOz('205/55 R16') === null, 'historical_conflict 205/55 R16 continues returning null')

console.log('--- Testing Acceptance Cases A through E (Calculadora Universal 01) ---')

// CASO A: 295/80 R22,5, qtd 10 -> Dose tabelada 32 fl oz, total 320 fl oz
const resCaseA = resolveDosageForApplication('295/80 R22,5')
assert(resCaseA.status === 'resolved', 'Caso A: 295/80 R22,5 resolves successfully')
if (resCaseA.status === 'resolved') {
  assert(resCaseA.source === 'table', 'Caso A: source is table')
  assert(resCaseA.label === 'Dose tabelada', 'Caso A: label is Dose tabelada')
  assert(resCaseA.fluidOzPerTire === 32, 'Caso A: dose is 32 fl oz/pneu')
  const totalOzCaseA = resCaseA.fluidOzPerTire * 10
  assert(totalOzCaseA === 320, 'Caso A: 10 tires total 320 fl oz')
  assert(Math.abs(ozToLiters(totalOzCaseA) - (320 / 33.814)) < 0.05, 'Caso A: coherent liters conversion')
  assert(ozToBucketsFractional(totalOzCaseA) === 0.5, 'Caso A: coherent fractional buckets (0.5)')
  assert(ozToBucketsCeil(totalOzCaseA) === 1, 'Caso A: 1 bucket p/ pedir (ceil)')
}

// CASO B: 205/55 R16 -> historical_conflict -> Consultar dosagem. Não usar /15.
const resCaseB = resolveDosageForApplication('205/55 R16', 'caminhao_onibus_rodoviario')
assert(resCaseB.status === 'requires_review', 'Caso B: 205/55 R16 requires review')
if (resCaseB.status === 'requires_review') {
  assert(resCaseB.reason === 'historical_conflict', 'Caso B: reason is historical_conflict')
  assert(resCaseB.label === 'Consultar dosagem', 'Caso B: label is Consultar dosagem')
}

// CASO C: 385/80 R22,5 + tipo caminhao_onibus_rodoviario -> Estimativa calculada ~47.24 fl oz
const resCaseC = resolveDosageForApplication('385/80 R22,5', 'caminhao_onibus_rodoviario')
assert(resCaseC.status === 'resolved', 'Caso C: 385/80 R22,5 resolves with heavy road usage')
if (resCaseC.status === 'resolved') {
  assert(resCaseC.source === 'empirical_heavy_road', 'Caso C: source is empirical_heavy_road')
  assert(resCaseC.label === 'Estimativa calculada', 'Caso C: label is Estimativa calculada')
  assert(Math.abs(resCaseC.fluidOzPerTire - 47.24) < 0.05, `Caso C: dose is approx 47.24 fl oz (${resCaseC.fluidOzPerTire.toFixed(4)})`)
  assert(!!resCaseC.disclaimer, 'Caso C: disclaimer is present')
}
assert(getDosageOz('385/80 R22,5') === null, 'Caso C: getDosageOz continues returning null')

// CASO D: Medida métrica ausente do catálogo, classificada como "outro_desconhecido" -> Consultar dosagem
// 225/60 R14 ou 315/80 R22,5 (ambas ausentes do catálogo)
assert(findCatalogEntry('315/80 R22,5') === undefined, '315/80 R22,5 is truly absent from catalog')
const resCaseD = resolveDosageForApplication('315/80 R22,5', 'outro_desconhecido')
assert(resCaseD.status === 'requires_review', 'Caso D: 315/80 R22,5 unclassified requires review')
if (resCaseD.status === 'requires_review') {
  assert(resCaseD.label === 'Consultar dosagem', 'Caso D: label is Consultar dosagem')
  assert(resCaseD.isMetric === true, 'Caso D: recognized as metric')
}

// CASO E: 305/70 R22,5 -> Deve retornar obrigatoriamente Dose tabelada = 32 fl oz
const resCaseE = resolveDosageForApplication('305/70 R22,5', 'caminhao_onibus_rodoviario')
assert(resCaseE.status === 'resolved', 'Caso E: 305/70 R22,5 resolves successfully')
if (resCaseE.status === 'resolved') {
  assert(resCaseE.source === 'table', 'Caso E: source MUST be table (prevails over /15)')
  assert(resCaseE.label === 'Dose tabelada', 'Caso E: label is Dose tabelada')
  assert(resCaseE.fluidOzPerTire === 32, 'Caso E: dose is exactly 32 fl oz')
}

console.log('--- ALL UNIT CHECKS PASSED ---')
