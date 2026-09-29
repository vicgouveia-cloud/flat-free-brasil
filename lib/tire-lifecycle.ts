import type { FlatFreeApplication, Occurrence } from './types'

export interface TireCycleBounds {
  startDate: string | null
  endDate: string | null
}

export function getTireCycleBoundsAtDate(
  tireId: string,
  referenceDate: string,
  occurrences: Occurrence[]
): TireCycleBounds {
  const recapDates = occurrences
    .filter(o => o.tireId === tireId && o.tipo === 'recapagem')
    .map(o => o.data)
    .sort((a, b) => a.localeCompare(b))

  const startDate = [...recapDates]
    .reverse()
    .find(date => date <= referenceDate) ?? null

  const endDate = recapDates.find(date => date > referenceDate) ?? null

  return { startDate, endDate }
}

export function isDateInTireCycle(
  date: string,
  bounds: TireCycleBounds
): boolean {
  if (bounds.startDate && date < bounds.startDate) return false
  if (bounds.endDate && date >= bounds.endDate) return false
  return true
}

export function getApplicationForTireCycleAtDate(
  tireId: string,
  referenceDate: string,
  applications: FlatFreeApplication[],
  occurrences: Occurrence[]
): FlatFreeApplication | null {
  const bounds = getTireCycleBoundsAtDate(tireId, referenceDate, occurrences)

  const matches = applications
    .filter(
      application =>
        application.tireId === tireId &&
        isDateInTireCycle(application.data, bounds)
    )
    .sort(
      (a, b) =>
        b.data.localeCompare(a.data) ||
        b.id.localeCompare(a.id)
    )

  return matches[0] ?? null
}
