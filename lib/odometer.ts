import type { FlatFreeApplication, TireReading } from './types'

export interface VehicleOdometerObservation {
  date: string
  km: number
  source: 'reading' | 'application'
}

export interface VehicleOdometerBounds {
  previous: VehicleOdometerObservation | null
  next: VehicleOdometerObservation | null
}

export function getVehicleOdometerBoundsAtDate(
  vehicleId: string,
  date: string,
  readings: TireReading[],
  applications: FlatFreeApplication[]
): VehicleOdometerBounds {
  const observations: VehicleOdometerObservation[] = [
    ...readings
      .filter(reading => reading.vehicleId === vehicleId)
      .map(reading => ({
        date: reading.data,
        km: reading.quilometragemVeiculo,
        source: 'reading' as const,
      })),
    ...applications
      .filter(application => application.vehicleId === vehicleId)
      .map(application => ({
        date: application.data,
        km: application.quilometragemAplicacao,
        source: 'application' as const,
      })),
  ]

  const previous =
    observations
      .filter(observation => observation.date < date)
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.km - a.km
      )[0] ?? null

  const next =
    observations
      .filter(observation => observation.date > date)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.km - b.km
      )[0] ?? null

  return { previous, next }
}
