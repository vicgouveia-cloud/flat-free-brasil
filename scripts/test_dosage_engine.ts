import {
  DOSAGE_CATALOG,
  getDosageOz,
  normalizeMeasure,
  calculateDoseFromFormula,
  calculateHeavyRoadDoseEmpirical,
  calculateLightRoadDoseEmpirical,
  calculateSlowMachineryDoseEmpirical,
  roundHalfUp,
  formatDoseValue,
  formatDoses,
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
assert(getDosageOz('205/55 R16') === null, 'Conflicting measure 205/55 R16 returns null in raw getDosageOz')
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
assert(getDosageOz('225/60 R14') === null, 'Unknown metric measure has no formula fallback in getDosageOz')
const expectedConflicts = ['165/70 R13', '175/65 R14', '175/70 R14', '195/55 R15', '195/60 R15', '205/55 R16', '225/55 R18', '225/65 R17', '265/70 R16']
assert(JSON.stringify(DOSAGE_CATALOG.filter(e => e.status === 'historical_conflict').map(e => e.canonicalMeasure).sort()) === JSON.stringify(expectedConflicts), 'Exact nine historical conflicts')
for (const measure of expectedConflicts) assert(getDosageOz(measure) === null, `${measure} blocks public getDosageOz`)
assert(DOSAGE_CATALOG.length === 63 && DOSAGE_CATALOG.filter(e => e.status === 'confirmed').length === 54, '63 entries, 54 confirmed')
for (const [category, count] of [['passeio_leve', 53], ['caminhao_onibus', 7], ['trator_maquinario', 3]] as const) {
  assert(DOSAGE_CATALOG.filter(e => e.category === category).length === count, `${category}: ${count} entries`)
}
assert(DOSAGE_TABLE.every(e => getDosageOz(e.measure) === e.fluidOzPerTire), 'Public table agrees with catalog')

console.log('--- Testing Round Half-Up and Formatting Helpers ---')
assert(roundHalfUp(9.13) === 9, 'roundHalfUp: 9.13 -> 9')
assert(roundHalfUp(9.49) === 9, 'roundHalfUp: 9.49 -> 9')
assert(roundHalfUp(9.50) === 10, 'roundHalfUp: 9.50 -> 10')
assert(roundHalfUp(9.51) === 10, 'roundHalfUp: 9.51 -> 10')
assert(roundHalfUp(47.24) === 47, 'roundHalfUp: 47.24 -> 47')
assert(roundHalfUp(47.50) === 48, 'roundHalfUp: 47.50 -> 48')
assert(formatDoseValue(8.5) === '8,5', 'formatDoseValue(8.5) is 8,5')
assert(formatDoseValue(32) === '32', 'formatDoseValue(32) is 32')
assert(formatDoses(1) === '1 dose', 'formatDoses(1) is 1 dose')
assert(formatDoses(8.5) === '8,5 doses', 'formatDoses(8.5) is 8,5 doses')
assert(formatDoses(32) === '32 doses', 'formatDoses(32) is 32 doses')
assert(formatDoses(47) === '47 doses', 'formatDoses(47) is 47 doses')

console.log('--- Testing Acceptance Cases A through G (Calculadora Universal 01-QUATER) ---')

// CASO A: 185/65 R15 -> confirmed no catálogo -> Dose de referência = 8,5 doses
const resCaseA = resolveDosageForApplication('185/65 R15')
assert(resCaseA.status === 'resolved', 'Caso A: 185/65 R15 resolves successfully')
if (resCaseA.status === 'resolved') {
  assert(resCaseA.source === 'table', 'Caso A: source is table')
  assert(resCaseA.label === 'Dose de referência', 'Caso A: label is Dose de referência')
  assert(resCaseA.appliedDose === 8.5, 'Caso A: appliedDose is exactly 8.5 (preserves table fraction)')
  assert(formatDoses(resCaseA.appliedDose) === '8,5 doses', 'Caso A: formatted dose is 8,5 doses')
}

// CASO B: 205/55 R16 -> historical_conflict no catálogo documental,
// mas resolvido automaticamente como passeio_leve (light_road) -> dose bruta ≈ 9.13 -> dose aplicada = 9 doses -> Dose estimada
const resCaseB = resolveDosageForApplication('205/55 R16')
assert(resCaseB.status === 'resolved', 'Caso B: 205/55 R16 auto-resolves via documentary category')
if (resCaseB.status === 'resolved') {
  assert(resCaseB.source === 'estimated', 'Caso B: source is estimated')
  assert(resCaseB.label === 'Dose estimada', 'Caso B: label is Dose estimada')
  assert(resCaseB.usageClass === 'light_road', 'Caso B: usage class is light_road')
  assert(resCaseB.rawCalculatedDose !== undefined, 'Caso B: rawCalculatedDose is defined')
  assert(Math.abs((resCaseB.rawCalculatedDose || 0) - 9.126) < 0.01, 'Caso B: raw dose ≈ 9.13')
  assert(resCaseB.appliedDose === 9, 'Caso B: appliedDose is 9 doses')
  assert(resCaseB.catalogEntry?.status === 'historical_conflict', 'Caso B: catalog status remains historical_conflict')
}

// CASO C: 385/80 R22,5 -> fora do catálogo -> solicita classe -> classe heavy_road -> bruta ≈ 47.24 -> dose aplicada = 47 doses -> Dose estimada
assert(findCatalogEntry('385/80 R22,5') === undefined, '385/80 R22,5 is outside catalog')
const resCaseC_unclassified = resolveDosageForApplication('385/80 R22,5')
assert(resCaseC_unclassified.status === 'requires_review', 'Caso C (unclassified): requires review')
if (resCaseC_unclassified.status === 'requires_review') {
  assert(resCaseC_unclassified.reason === 'needs_usage_class', 'Caso C (unclassified): reason is needs_usage_class')
  assert(resCaseC_unclassified.label === 'Consultar dosagem', 'Caso C (unclassified): label is Consultar dosagem')
}
const resCaseC = resolveDosageForApplication('385/80 R22,5', 'heavy_road')
assert(resCaseC.status === 'resolved', 'Caso C: 385/80 R22,5 resolves with heavy_road')
if (resCaseC.status === 'resolved') {
  assert(resCaseC.source === 'estimated', 'Caso C: source is estimated')
  assert(resCaseC.label === 'Dose estimada', 'Caso C: label is Dose estimada')
  assert(Math.abs((resCaseC.rawCalculatedDose || 0) - 47.24) < 0.05, 'Caso C: raw dose ≈ 47.24')
  assert(resCaseC.appliedDose === 47, 'Caso C: appliedDose is 47 doses')
  assert(formatDoses(resCaseC.appliedDose) === '47 doses', 'Caso C: formatted dose is 47 doses')
}

// CASO D: 315/80 R22,5 -> fora do catálogo -> seleção heavy_road calcula dose esperada (bruta ≈ 35.01 -> aplicada = 35 doses)
assert(findCatalogEntry('315/80 R22,5') === undefined, '315/80 R22,5 is outside catalog')
const resCaseD_unclassified = resolveDosageForApplication('315/80 R22,5')
assert(resCaseD_unclassified.status === 'requires_review', 'Caso D (unclassified): requires review')
const resCaseD = resolveDosageForApplication('315/80 R22,5', 'heavy_road')
assert(resCaseD.status === 'resolved', 'Caso D: 315/80 R22,5 resolves with heavy_road')
if (resCaseD.status === 'resolved') {
  assert(resCaseD.source === 'estimated', 'Caso D: source is estimated')
  assert(resCaseD.label === 'Dose estimada', 'Caso D: label is Dose estimada')
  assert(Math.abs((resCaseD.rawCalculatedDose || 0) - 35.01) < 0.05, 'Caso D: raw dose ≈ 35.01')
  assert(resCaseD.appliedDose === 35, 'Caso D: appliedDose is 35 doses')
  assert(formatDoses(resCaseD.appliedDose) === '35 doses', 'Caso D: formatted dose is 35 doses')
}

// CASO E: 305/70 R22,5 -> confirmed no catálogo -> Dose de referência = 32 doses (NÃO recalculada)
const resCaseE = resolveDosageForApplication('305/70 R22,5', 'heavy_road')
assert(resCaseE.status === 'resolved', 'Caso E: 305/70 R22,5 resolves successfully')
if (resCaseE.status === 'resolved') {
  assert(resCaseE.source === 'table', 'Caso E: source MUST be table (prevails over formulas)')
  assert(resCaseE.label === 'Dose de referência', 'Caso E: label is Dose de referência')
  assert(resCaseE.appliedDose === 32, 'Caso E: appliedDose is exactly 32 doses')
  assert(resCaseE.rawCalculatedDose === undefined, 'Caso E: no formula calculation performed')
}

// CASO F: Medida métrica com classe trator / maquinário -> divisor 10 -> Dose estimada
const resCaseF = resolveDosageForApplication('385/80 R22,5', 'slow_machinery')
assert(resCaseF.status === 'resolved', 'Caso F: metric with slow_machinery resolves')
if (resCaseF.status === 'resolved') {
  assert(resCaseF.source === 'estimated', 'Caso F: source is estimated')
  assert(resCaseF.label === 'Dose estimada', 'Caso F: label is Dose estimada')
  assert(Math.abs((resCaseF.rawCalculatedDose || 0) - 70.86) < 0.05, 'Caso F: raw dose ≈ 70.86')
  assert(resCaseF.appliedDose === 71, 'Caso F: appliedDose is 71 doses (half-up from 70.86)')
  assert(formatDoses(resCaseF.appliedDose) === '71 doses', 'Caso F: formatted dose is 71 doses')
}

// CASO G: Medida não métrica sem referência de tabela -> Consultar dosagem
const resCaseG = resolveDosageForApplication('14-17.5')
assert(resCaseG.status === 'requires_review', 'Caso G: non-metric uncataloged requires review')
if (resCaseG.status === 'requires_review') {
  assert(resCaseG.label === 'Consultar dosagem', 'Caso G: label is Consultar dosagem')
  assert(resCaseG.isMetric === false, 'Caso G: isMetric is false')
}

console.log('--- ALL UNIT AND ACCEPTANCE CHECKS PASSED ---')
