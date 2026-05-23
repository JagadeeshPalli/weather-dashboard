/**
 * useAirQuality — fetches OWM air_pollution for a lat/lon pair.
 * Caches in localStorage for 30 minutes (AQ changes slowly).
 * Returns null while loading or when no coords supplied.
 */
import { useState, useEffect } from 'react'
import { fetchAirQuality } from '../services/weatherApi'
import type { AirQualityResponse } from '../types/weather'

const CACHE_TTL_MS = 30 * 60 * 1000

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts }: { data: T; ts: number } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota */ }
}

interface AQState {
  data:    AirQualityResponse | null
  loading: boolean
  error:   string | null
}

export function useAirQuality(lat: number | null, lon: number | null): AQState {
  const [state, setState] = useState<AQState>({ data: null, loading: false, error: null })

  useEffect(() => {
    if (lat === null || lon === null) return

    const key = `wx_aq_${lat.toFixed(2)}_${lon.toFixed(2)}`
    const cached = readCache<AirQualityResponse>(key)
    if (cached) {
      setState({ data: cached, loading: false, error: null })
      return
    }

    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetchAirQuality(lat, lon)
      .then((data) => {
        if (cancelled) return
        writeCache(key, data)
        setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to fetch air quality'
        setState({ data: null, loading: false, error: message })
      })

    return () => { cancelled = true }
  }, [lat, lon])

  return state
}
