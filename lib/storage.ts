// =============================================
// Storage Layer - Demo Mode with localStorage
// Replace this layer with Supabase calls later
// without rewriting the UI components.
// =============================================

import type {
  Company, Unit, Vehicle, Tire, TireReading, FlatFreeApplication,
  PilotProject, Order, Occurrence, TirePositionHistory
} from './types'
import {
  DEMO_COMPANY, DEMO_UNITS, DEMO_VEHICLES, DEMO_TIRES, DEMO_READINGS, DEMO_APPLICATIONS,
  DEMO_PROJECTS, DEMO_ORDERS, DEMO_POSITION_HISTORY
} from './demo-data'
import { getSlotIdFromPosition } from './vehicle-layout'

const KEYS = {
  company: 'ff_company',
  units: 'ff_units',
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

// Units
export function getUnits(): Unit[] { return load(KEYS.units, DEMO_UNITS) }
export function saveUnits(u: Unit[]): void { save(KEYS.units, u) }

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

export interface CloseTirePositionResult {
  ok: boolean
  history: TirePositionHistory[]
  error?: 'invalid_date'
}

export function closeTirePositionAtDate(
  tireId: string,
  date: string,
  allHistory: TirePositionHistory[]
): CloseTirePositionResult {
  const current = allHistory.find(
    entry => entry.tireId === tireId && !entry.dataFinal
  )

  if (!current) {
    return { ok: true, history: allHistory }
  }

  if (date < current.dataInicial) {
    return { ok: false, history: allHistory, error: 'invalid_date' }
  }

  return {
    ok: true,
    history: allHistory.map(entry =>
      entry.id === current.id ? { ...entry, dataFinal: date } : entry
    ),
  }
}

export interface MountTireToSlotResult {
  ok: boolean
  history: TirePositionHistory[]
  error?: 'slot_occupied' | 'invalid_date' | 'already_mounted'
}

export function mountTireToVehicleSlot(
  tireId: string,
  vehicleId: string,
  slotId: string,
  date: string,
  allHistory: TirePositionHistory[]
): MountTireToSlotResult {
  const currentForTire = allHistory.find(
    entry => entry.tireId === tireId && !entry.dataFinal
  )

  if (currentForTire && date < currentForTire.dataInicial) {
    return { ok: false, history: allHistory, error: 'invalid_date' }
  }

  const currentSlotId = currentForTire
    ? currentForTire.slotId || getSlotIdFromPosition(currentForTire.posicao)
    : null

  if (
    currentForTire &&
    currentForTire.vehicleId === vehicleId &&
    currentSlotId === slotId
  ) {
    return { ok: false, history: allHistory, error: 'already_mounted' }
  }

  const occupied = allHistory.some(entry => {
    if (entry.dataFinal || entry.vehicleId !== vehicleId) return false
    const entrySlotId = entry.slotId || getSlotIdFromPosition(entry.posicao)
    return entrySlotId === slotId && entry.tireId !== tireId
  })

  if (occupied) {
    return { ok: false, history: allHistory, error: 'slot_occupied' }
  }

  const closedHistory = currentForTire
    ? allHistory.map(entry =>
        entry.id === currentForTire.id
          ? { ...entry, dataFinal: date }
          : entry
      )
    : allHistory

  const newEntry: TirePositionHistory = {
    id: uuid(),
    tireId,
    vehicleId,
    slotId,
    posicao: slotId,
    dataInicial: date,
  }

  return {
    ok: true,
    history: [...closedHistory, newEntry],
  }
}

interface PositionEvent {
  tireId: string
  vehicleId: string
  posicao: string
  data: string
}

function updatePositionHistory(
  event: PositionEvent,
  allHistory: TirePositionHistory[]
): TirePositionHistory[] {
  const openEntry = allHistory.find(
    h => h.tireId === event.tireId && !h.dataFinal
  )

  if (!openEntry) {
    const eventSlotId = getSlotIdFromPosition(event.posicao)
    const newEntry: TirePositionHistory = {
      id: uuid(),
      tireId: event.tireId,
      vehicleId: event.vehicleId,
      ...(eventSlotId ? { slotId: eventSlotId } : {}),
      posicao: event.posicao,
      dataInicial: event.data,
    }
    return [...allHistory, newEntry]
  }

  const sameVehicle = openEntry.vehicleId === event.vehicleId
  const eventSlotId = getSlotIdFromPosition(event.posicao)
  const openSlotId = openEntry.slotId || getSlotIdFromPosition(openEntry.posicao)
  const samePosition =
    eventSlotId && openSlotId
      ? eventSlotId === openSlotId
      : openEntry.posicao === event.posicao

  if (sameVehicle && samePosition) {
    return allHistory
  }

  const closed = allHistory.map(h =>
    h.id === openEntry.id ? { ...h, dataFinal: event.data } : h
  )
  const newEntry: TirePositionHistory = {
    id: uuid(),
    tireId: event.tireId,
    vehicleId: event.vehicleId,
    ...(eventSlotId ? { slotId: eventSlotId } : {}),
    posicao: event.posicao,
    dataInicial: event.data,
  }
  return [...closed, newEntry]
}

/**
 * Use the application itself as the treated tire's operational baseline.
 * Old locally stored applications may not have vehicle/position data; in that
 * case the history remains unchanged until a reading supplies that context.
 */
export function updatePositionHistoryOnApplication(
  application: FlatFreeApplication,
  allHistory: TirePositionHistory[]
): TirePositionHistory[] {
  if (!application.vehicleId || !application.posicaoInicial) return allHistory

  return updatePositionHistory(
    {
      tireId: application.tireId,
      vehicleId: application.vehicleId,
      posicao: application.posicaoInicial,
      data: application.data,
    },
    allHistory
  )
}

/**
 * Call this whenever a new reading is saved.
 * Handles opening/closing position history entries automatically.
 */
export function updatePositionHistoryOnReading(
  reading: TireReading,
  allHistory: TirePositionHistory[]
): TirePositionHistory[] {
  return updatePositionHistory(
    {
      tireId: reading.tireId,
      vehicleId: reading.vehicleId,
      posicao: reading.posicaoAtual,
      data: reading.data,
    },
    allHistory
  )
}
