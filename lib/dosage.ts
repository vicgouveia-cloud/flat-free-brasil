// Canonical dosage table - add new tire sizes here
// Values are deliberate canonical doses - do not interpolate or invent
export interface DosageEntry {
  measure: string
  doses: number
}

export const DOSAGE_TABLE: DosageEntry[] = [
  { measure: '275/80 R22,5', doses: 28 },
  { measure: '295/80 R22,5', doses: 34 },
]

// Bucket size in liters (US 5-gallon bucket)
export const BUCKET_LITERS = 18.9

export function getDosage(measure: string): number | null {
  const entry = DOSAGE_TABLE.find(e => e.measure === measure)
  return entry ? entry.doses : null
}

export function calcBuckets(totalDoses: number): number {
  // 1 dose = 1 liter (adjust if product changes)
  const liters = totalDoses
  return liters / BUCKET_LITERS
}
