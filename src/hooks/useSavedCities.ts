/**
 * useSavedCities — CRUD for the localStorage saved-cities list.
 *
 * Rules:
 * - Max 6 cities. Adding when full drops the oldest (by addedAt).
 * - Duplicate detection by id = `${lat.toFixed(3)}_${lon.toFixed(3)}`.
 *   Re-adding an existing city moves it to the front (most-recent first).
 * - updateSnap() is called by App.tsx whenever current weather loads
 *   so each mini card always shows the last-seen temp + icon.
 */
import { useState, useCallback } from 'react'
import type { SavedCity } from '../types/weather'

const LS_KEY  = 'wx_saved_cities'
const MAX     = 6

function makeId(lat: number, lon: number): string {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`
}

function readLS(): SavedCity[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as SavedCity[]) : []
  } catch {
    return []
  }
}

function writeLS(cities: SavedCity[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cities))
  } catch { /* quota */ }
}

export function useSavedCities() {
  const [cities, setCities] = useState<SavedCity[]>(readLS)

  /** Add or bump a city to the front of the list. Trims to MAX. */
  const addCity = useCallback(
    (city: { lat: number; lon: number; name: string; country: string }) => {
      setCities((prev) => {
        const id = makeId(city.lat, city.lon)
        // Preserve existing snap if the city is already saved
        const existing = prev.find((c) => c.id === id)
        const entry: SavedCity = {
          id,
          lat:     city.lat,
          lon:     city.lon,
          name:    city.name,
          country: city.country,
          snap:    existing?.snap,
          addedAt: Date.now(),
        }
        // Remove duplicate, prepend, enforce max
        const filtered = prev.filter((c) => c.id !== id)
        const next = [entry, ...filtered].slice(0, MAX)
        writeLS(next)
        return next
      })
    },
    []
  )

  /** Remove a city by id. */
  const removeCity = useCallback((id: string) => {
    setCities((prev) => {
      const next = prev.filter((c) => c.id !== id)
      writeLS(next)
      return next
    })
  }, [])

  /**
   * Update the weather snapshot for a city (called after load() succeeds).
   * Matches by lat/lon proximity (same id formula).
   */
  const updateSnap = useCallback(
    (lat: number, lon: number, snap: { temp: number; icon: string; unit: 'C' | 'F' }) => {
      const id = makeId(lat, lon)
      setCities((prev) => {
        const idx = prev.findIndex((c) => c.id === id)
        if (idx === -1) return prev
        const next = [...prev]
        next[idx] = { ...next[idx], snap }
        writeLS(next)
        return next
      })
    },
    []
  )

  return { cities, addCity, removeCity, updateSnap }
}
