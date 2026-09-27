// Canonical dosage table — add new tire sizes here.
// Unit: US fluid ounces (fl oz) per tire.
// Conversions: 1 US gallon = 128 fl oz | 1 bucket (5 US gal) = 640 fl oz ≈ 18.9 L
// These values are deliberate canonical doses — do not interpolate or invent.
export interface DosageEntry {
  measure: string
  fluidOzPerTire: number
}

export const DOSAGE_TABLE: DosageEntry[] = [
  { measure: '275/80 R22,5', fluidOzPerTire: 28 },
  { measure: '295/80 R22,5', fluidOzPerTire: 34 },
]

/** US fl oz per US gallon */
export const OZ_PER_GALLON = 128
/** fl oz per 5-gallon bucket */
export const OZ_PER_BUCKET = 640
/** Liters per 5-gallon bucket (approximate) */
export const LITERS_PER_BUCKET = 18.9
/** fl oz per liter (approximate) */
export const OZ_PER_LITER = 33.814

/**
 * Returns the canonical dose in fl oz for a given tire measure.
 * Returns null if measure is not in the table (show "Consultar dosagem").
 */
export function getDosageOz(measure: string): number | null {
  const entry = DOSAGE_TABLE.find(e => e.measure === measure)
  return entry ? entry.fluidOzPerTire : null
}

/** Convert total fl oz to liters */
export function ozToLiters(oz: number): number {
  return oz / OZ_PER_LITER
}

/** How many 5-gal buckets needed, exact (may be fractional) */
export function ozToBucketsFractional(oz: number): number {
  return oz / OZ_PER_BUCKET
}

/** How many 5-gal buckets to ORDER (rounded up) */
export function ozToBucketsCeil(oz: number): number {
  return Math.ceil(oz / OZ_PER_BUCKET)
}
