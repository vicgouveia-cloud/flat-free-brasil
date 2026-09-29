import type { Vehicle, VehicleLayoutType } from './types'

export interface VehicleTireSlot {
  id: string
  axle: number
  side: 'left' | 'right'
  position: 'single' | 'inner' | 'outer'
}

export interface VehicleAxleLayout {
  axle: number
  dual: boolean
  slots: VehicleTireSlot[]
}

export interface VehicleLayoutDefinition {
  type: VehicleLayoutType
  axleCount: number
  axles: VehicleAxleLayout[]
}

export const VEHICLE_LAYOUT_LABELS: Record<VehicleLayoutType, string> = {
  truck: 'Caminhão',
  tractor: 'Cavalo mecânico',
  semi_trailer: 'Semirreboque',
  trailer: 'Reboque / carreta',
  other: 'Outro',
}

export function inferVehicleLayoutType(vehicle: Pick<Vehicle, 'layoutType' | 'tipo'>): VehicleLayoutType {
  if (vehicle.layoutType) return vehicle.layoutType

  const value = vehicle.tipo.toLowerCase()
  if (value.includes('semirreboque') || value.includes('semi-reboque')) return 'semi_trailer'
  if (value.includes('reboque') || value.includes('carreta')) return 'trailer'
  if (value.includes('cavalo')) return 'tractor'
  if (value.includes('caminh')) return 'truck'
  return 'other'
}

function getAxleCount(vehicle: Pick<Vehicle, 'configuracaoEixos' | 'layoutType' | 'tipo'>) {
  const configuration = vehicle.configuracaoEixos?.toLowerCase() || ''

  const driveConfiguration = configuration.match(/(\d+)\s*x\s*\d+/)
  if (driveConfiguration) {
    const wheelPositions = Number(driveConfiguration[1])
    if (Number.isFinite(wheelPositions) && wheelPositions >= 2) {
      return Math.max(1, Math.round(wheelPositions / 2))
    }
  }

  const explicitAxles = configuration.match(/(\d+)\s*eixos?/)
  if (explicitAxles) return Math.max(1, Number(explicitAxles[1]))

  const type = inferVehicleLayoutType(vehicle)
  if (type === 'semi_trailer' || type === 'trailer') return 3
  if (type === 'truck' || type === 'tractor') return 3
  return 2
}

function makeSlots(axle: number, dual: boolean): VehicleTireSlot[] {
  if (!dual) {
    return [
      { id: `E${axle}-L`, axle, side: 'left', position: 'single' },
      { id: `E${axle}-R`, axle, side: 'right', position: 'single' },
    ]
  }

  return [
    { id: `E${axle}-LO`, axle, side: 'left', position: 'outer' },
    { id: `E${axle}-LI`, axle, side: 'left', position: 'inner' },
    { id: `E${axle}-RI`, axle, side: 'right', position: 'inner' },
    { id: `E${axle}-RO`, axle, side: 'right', position: 'outer' },
  ]
}

export function getVehicleLayout(vehicle: Vehicle): VehicleLayoutDefinition {
  const type = inferVehicleLayoutType(vehicle)
  const axleCount = getAxleCount(vehicle)

  const axles = Array.from({ length: axleCount }, (_, index) => {
    const axle = index + 1
    const dual =
      type === 'semi_trailer' ||
      type === 'trailer' ||
      (type !== 'other' && axle > 1)

    return {
      axle,
      dual,
      slots: makeSlots(axle, dual),
    }
  })

  return { type, axleCount, axles }
}


export function getSlotIdFromPosition(position: string): string | null {
  const normalized = position.trim().toLowerCase()

  if (/^e\d+-(?:l|r|lo|li|ri|ro)$/i.test(position.trim())) {
    return position.trim().toUpperCase()
  }

  const legacyMap: Record<string, string> = {
    'dianteiro esquerdo': 'E1-L',
    'dianteira esquerda': 'E1-L',
    'dianteiro direito': 'E1-R',
    'dianteira direita': 'E1-R',
  }

  return legacyMap[normalized] || null
}
