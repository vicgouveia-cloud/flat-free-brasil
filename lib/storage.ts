// =============================================
// Storage Layer - Demo Mode with localStorage
// Replace this layer with Supabase calls later
// without rewriting the UI components.
// =============================================

import type { Vehicle, Tire, TireReading, FlatFreeApplication, PilotProject, Order, Occurrence } from './types'
import { DEMO_VEHICLES, DEMO_TIRES, DEMO_READINGS, DEMO_APPLICATIONS, DEMO_PROJECTS, DEMO_ORDERS } from './demo-data'

const KEYS = {
  vehicles: 'ff_vehicles',
  tires: 'ff_tires',
  readings: 'ff_readings',
  applications: 'ff_applications',
  projects: 'ff_projects',
  orders: 'ff_orders',
  occurrences: 'ff_occurrences',
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

export function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

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
