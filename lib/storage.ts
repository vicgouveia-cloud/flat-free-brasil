// =============================================
// Storage Layer - Demo Mode with localStorage
// Replace this layer with Supabase calls later
// without rewriting the UI components.
// =============================================

import type {
  Company, Vehicle, Tire, TireReading, FlatFreeApplication,
  PilotProject, Order, Occurrence, TirePositionHistory
} from './types'
import {
  DEMO_COMPANY, DEMO_VEHICLES, DEMO_TIRES, DEMO_READINGS, DEMO_APPLICATIONS,
  DEMO_PROJECTS, DEMO_ORDERS, DEMO_POSITION_HISTORY
} from './demo-data'

const KEYS = {
  company: 'ff_company',
  vehicles: 'ff_vehicles',
  tires: 'ff_tires',
  readings: 'ff_readings',
  applications: 'ff_applications',
  projects: 'ff_projects',
  orders: 'ff_orders',
  occurrences: 'ff_occurrences',
  positionHistory: 'ff_position_history',
}

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T[]
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function loadOne<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveOne<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// Company
export function getCompany(): Company { return loadOne(KEYS.company, DEMO_COMPANY) }
export function saveCompany(company: Company): void { saveOne(KEYS.company, company) }

// Vehicles
export function getVehicles(): Vehicle[] { return load(KEYS.vehicles, DEMO_VEHICLES) }
export function saveVehicles(v: Vehicle[]): void { save(KEYS.vehicles, v) }

// Tires
export function getTires(): Tire[] { return load(KEYS.tires, DEMO_TIRES) }
export function saveTires(t: Tire[]): void { save(KEYS.tires, t) }

// Readings
export function getReadings(): TireReading[] { return load(KEYS.readings, DEMO_READINGS) }
export function saveReadings(r: TireReading[]): void { save(KEYS.readings, r) }

// Applications
export function getApplications(): FlatFreeApplication[] { return load(KEYS.applications, DEMO_APPLICATIONS) }
export function saveApplications(a: FlatFreeApplication[]): void { save(KEYS.applications, a) }

// Projects
export function getProjects(): PilotProject[] { return load(KEYS.projects, DEMO_PROJECTS) }
export function saveProjects(p: PilotProject[]): void { save(KEYS.projects, p) }

// Orders
export function getOrders(): Order[] { return load(KEYS.orders, DEMO_ORDERS) }
export function saveOrders(o: Order[]): void { save(KEYS.orders, o) }

// Occurrences
export function getOccurrences(): Occurrence[] { return load(KEYS.occurrences, []) }
export function saveOccurrences(o: Occurrence[]): void { save(KEYS.occurrences, o) }

// Position History
export function getPositionHistory(): TirePositionHistory[] {
  return load(KEYS.positionHistory, DEMO_POSITION_HISTORY)
}
export function savePositionHistory(h: TirePositionHistory[]): void {
  save(KEYS.positionHistory, h)
}

/**
 * Call this whenever a new reading is saved.
 * Handles opening/closing position history entries automatically.
 */
export function updatePositionHistoryOnReading(
  reading: TireReading,
  allHistory: TirePositionHistory[]
): TirePositionHistory[] {
  const openEntry = allHistory.find(
    h => h.tireId === reading.tireId && !h.dataFinal
  )

  if (!openEntry) {
    // No history yet — create initial entry
    const newEntry: TirePositionHistory = {
      id: uuid(),
      tireId: reading.tireId,
      vehicleId: reading.vehicleId,
      posicao: reading.posicaoAtual,
      dataInicial: reading.data,
    }
    return [...allHistory, newEntry]
  }

  const sameVehicle = openEntry.vehicleId === reading.vehicleId
  const samePosition = openEntry.posicao === reading.posicaoAtual

  if (sameVehicle && samePosition) {
    // No change — leave as is
    return allHistory
  }

  // Position or vehicle changed — close old entry and open new one
  const closed = allHistory.map(h =>
    h.id === openEntry.id ? { ...h, dataFinal: reading.data } : h
  )
  const newEntry: TirePositionHistory = {
    id: uuid(),
    tireId: reading.tireId,
    vehicleId: reading.vehicleId,
    posicao: reading.posicaoAtual,
    dataInicial: reading.data,
  }
  return [...closed, newEntry]
}
