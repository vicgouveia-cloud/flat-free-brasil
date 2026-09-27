import {
  getDosageOz,
  normalizeMeasure,
  calculateDoseFromFormula,
  findCatalogEntry,
  DOSAGE_TABLE,
  OZ_PER_BUCKET,
  LITERS_PER_BUCKET,
  BUCKET_LITERS,
  ozToLiters,
  ozToBucketsFractional,
  ozToBucketsCeil,
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
assert(getDosageOz('295/80 R22,5') === 34, '295/80 R22,5 canonical returns 34 fl oz')

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
  assert(getDosageOz(a) === 34, `Alias "${a}" resolves to 34 fl oz`)
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
// 205/55 R16 has historical conflict (9.0 vs 9.5) -> must NOT return silent official dose
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
assert(Math.abs(ozToLiters(640) - 18.927) < 0.1, '640 fl oz ≈ 18.9 L')

console.log('--- Testing Isolated Formula Engine ---')
// ASI formula: (Height * Width) / 22 for >45mph
const resOver = calculateDoseFromFormula({
  tireHeightInches: 25,
  treadWidthInches: 8,
  speedRegime: 'over_45_mph',
})
assert(Math.abs(resOver.rawOunces - (200 / 22)) < 0.001, 'Formula >45mph divisor 22')
assert(resOver.divisor === 22, 'Divisor is 22')

// Under 45mph: divisor 10
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

console.log('--- ALL UNIT CHECKS PASSED ---')
